/* eslint-disable max-lines */
import {
	css, html, LitElement
} from 'lit-element/lit-element.js';

import './cosmoz-page-route.js';

const stopPropagation = e => e.stopPropagation(),
	activeRoutes = [],
	imports = {},
	getHashUrl = () => {
		const hash = window.location.hash,
			prefixLength = hash.startsWith('#!/') ? 2 : 0,
			url = new URL(window.location.origin + hash.substring(prefixLength));
		return {
			path: url.pathname,
			hash: url.hash,
			search: url.search
		};
	};

class CosmozPageRouter extends LitElement {
	static get styles() {
		return css`
			#routes {
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
			}
			::slotted(:not(.active-route)) {
				display: none;
			}
		`;
	}
	render() {
		return html`
			<div id="routes">
				<slot></slot>
			</div>
		`;
	}

	constructor() {
		super();
		this.fileSuffix = '.js';
		this.noAdHoc = false;
		this.urlPrefix = '';
		this._currentRoute = null;
		this._initialized = false;
		this._previousRoute = null;
		this._previousUrl = null;
		this._routesInError = null;
		this._boundStateChange = this._stateChange.bind(this);
	}
	/**
	 * Get component properties.
	 *
	 * @returns {string} Name.
	 */
	static get properties() {
		return {
			/* Ad-hoc routing template file name suffix */
			fileSuffix: {
				type: String,
				attribute: 'file-suffix'
			},
			/* Don't create ad-hoc routes but instead fire a `not-found` event */
			noAdHoc: {
				type: Boolean,
				attribute: 'no-ad-hoc'
			},
			/* Anything to prefix ad-hoc routes with, be it a `views` folder or a different domain */
			urlPrefix: {
				type: String,
				attribute: 'url-prefix'
			}
		};
	}

	connectedCallback() {
		super.connectedCallback();
		[
			'template-activate',
			'template-created'
		].forEach(e => this.addEventListener(e, stopPropagation));
		window.addEventListener('popstate', this._boundStateChange);
		this._routesInError = {};
		setTimeout(this._boundStateChange);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		[
			'template-activate',
			'template-created'
		].forEach(e => this.removeEventListener(e, stopPropagation));
		window.removeEventListener('popstate', this._boundStateChange);
	}
	/**
	* Utility function that fires an event from a polymer element and return
	* false if preventDefault has been called on the event.
	*
	* @param {String} type The event type
	* @param {Object} detail The event detail
	* @param {Boolean} bubbles True if event should bubble
	* @return {Boolean} `true` = continue, `false` = prevent further actions
	*/
	_fireEvent(type, detail, bubbles) {
		return this.dispatchEvent(new CustomEvent(type,	{
			bubbles: !!bubbles,
			cancelable: true,
			composed: true,
			detail
		}));
	}

	go(path, options) {
		const _path = '#!' + path;

		if (options && options.replace === true) {
			window.history.replaceState(null, null, _path);
		} else {
			window.history.pushState(null, null, _path);
		}

		// dispatch a popstate event
		window.dispatchEvent(new CustomEvent('popstate', {
			bubbles: false,
			composed: true,
			detail: {
				state: {}
			}
		}));
	}

	// eslint-disable-next-line max-statements, max-lines-per-function
	_stateChange() {
		const url = getHashUrl(),
			eventDetail = {
				path: url.path
			},
			unchangedRoute = this._previousUrl &&
				url.path === this._previousUrl.path &&
				url.search === this._previousUrl.search;

		this._previousUrl = url;

		if (unchangedRoute) {
			return;
		}

		// fire a state-change event on the app-router and return early if the user called event.preventDefault()
		if (!this._fireEvent('state-change', eventDetail)) {
			return;
		}

		if (this._routesInError[url.path]) {
			const errorEvent = this._routesInError[url.path];
			this._fireEvent('import-error', errorEvent);
			return;
		}

		{
			// find the first matching route
			const route = activeRoutes.find(route => route.path === url.path);
			if (route != null) {
				this._activateRoute(route, url);
				return;
			}
		}

		let route = this.firstChild;
		while (route) {
			if (route.tagName === 'COSMOZ-PAGE-ROUTE' && route.path === url.path) {
				this._activateRoute(route, url);
				return;
			}
			route = route.nextSibling;
		}

		eventDetail.url = url;

		if (this.noAdHoc) {
			this._fireEvent('not-found', eventDetail);
			return;
		}

		// add ad-hoc
		const importUri = this.urlPrefix + url.path + this.fileSuffix,
			templateId = url.path.substring(1).replace(/\//ug, '-'),
			routeUrl = getHashUrl(),
			newRoute = this.addRoute({
				import: importUri,
				path: url.path,
				templateId
			});

		this._activateRoute(newRoute, routeUrl);
	}

	/**
	 * Add a `cosmoz-page-route` element
	 * @param {Object} route { templateId: 'Route template-id', import: 'Route import', path: 'Route path' }
	 * @returns {void}
	 */
	addRoute(route) {
		const element = document.createElement('cosmoz-page-route');
		Object.assign(element, route);

		this._fireEvent('before-add-route', {
			route: element
		}, true);

		return this.appendChild(element);
	}
	/**
	 * Get the active route.
	 * @returns {object} Active route.
	 */
	get activeRoute() {
		return this._activeRoute;
	}

	removeRoute(route, resetPrevUrl = false) {
		if (route == null) {
			return;
		}
		const index = activeRoutes.indexOf(route),
			parent = route.parentNode;
		if (index > -1) {
			activeRoutes.splice(index, 1);
		}
		if (parent) {
			parent.removeChild(route);
		}
		if (resetPrevUrl) {
			this._previousUrl = null;
		}
	}

	refresh(force = false) {
		if (force) {
			this._previousUrl = null;
		}
		this._stateChange();
	}

	_activateRoute(route, url) {
		if (route.redirect) {
			this.go(route.redirect, {
				replace: true
			});
			return;
		}

		const eventDetail = {
			path: url.path,
			route,
			oldRoute: this._activeRoute
		};

		// keep track of the route currently being loaded
		this._loadingRoute = route;

		this._fireEvent('route-loading', eventDetail);

		if (!imports[route.import]) {
			imports[route.import] = import(route.import)
				.catch(e => {
					const importErrorEvent = {
						route,
						errorEvent: e
					};
					this._routesInError[route.import] = importErrorEvent;
					this._fireEvent('import-error', importErrorEvent);
				});
		}

		imports[route.import].then(() => {
			if (route !== this._loadingRoute) {
				return;
			}
			const model = this._createModel(route, url, eventDetail);
			Object.assign(route.templateInstance, model);
			if (!activeRoutes.includes(route)) {
				activeRoutes.push(route);
			}
			if (route !== this._activeRoute) {
				this._changeRoute();
			}
			this._fireEvent('template-activate', eventDetail, true);
		});
	}

	_changeRoute(oldRoute, newRoute) {
		let oRoute = oldRoute,
			nRoute = newRoute;

		if (oRoute == null) {
			oRoute = this._activeRoute;
		}

		if (nRoute == null) {
			nRoute = this._loadingRoute;
		}

		// update references to the activeRoute, previousRoute, and loadingRoute
		this._previousRoute = oRoute;
		this._activeRoute = nRoute;
		this._loadingRoute = null;

		if (this._previousRoute) {
			this._previousRoute.classList.remove('active-route');
			if (!this._previousRoute.persist) {
				this.removeRoute(this._previousRoute);
			}
		}
		this._activeRoute.classList.add('active-route');
	}

	_createModel(route, url, eventDetail) {
		const model = {
			params: Object.fromEntries(new URLSearchParams(url.search))
		};

		if (!!route.bindRouter || !!this.bindRouter) {
			model.router = this;
		}

		eventDetail.model = model;
		this._fireEvent('before-data-binding', eventDetail);
		return eventDetail.model;
	}
}

customElements.define('cosmoz-page-router', CosmozPageRouter);

/**
 * Fires when the URL changes and cosmoz-page-router is about to do work. If a listener calls `event.preventDefault()` on this, the routing action is cancelled.
 *
 * Useful to subscribe to if re-routing / redirects are going to be made.
 * @event state-change
 * @param {{ path: url.path }} detail
 */

/**
 * Fires when ad-hoc routing initiates, to allow the host application / component to display a loading message, if necessary.
 *
 * @event route-loading
 * @param {{
		path: url.path,
		route: route,
		oldRoute: this._activeRoute
	}} detail
*/

/**
 * If the HTML import fails (404 file not found or similar). A good place to show an error message to the user.
 *
 * @event import-error
 * @param {{
		route: route,
		errorEvent: event
	}} detail
*/

/**
 * Fires if the HTML import succeeded but no template with the correct ID could be located in the import.
 *
 * @event template-not-found
 * @param {{
		path: url.path,
		route: route,
		oldRoute: this._activeRoute
	}} detail
*/
