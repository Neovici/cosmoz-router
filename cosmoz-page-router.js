/* eslint-disable max-lines */
import '@polymer/iron-flex-layout/iron-flex-layout.js';

import {
	PolymerElement, html
} from '@polymer/polymer/polymer-element.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { flush } from '@polymer/polymer/lib/utils/flush.js';

import './cosmoz-page-route.js';
import * as utils from './cosmoz-page-router-utilities';

window.Cosmoz = window.Cosmoz || {};
window.Cosmoz.TemplateView = {};

const stopPropagation = e => e.stopPropagation();
/**
`<cosmoz-page-router>` is a template based client-side routing solution

### Usage

Make sure the `<cosmoz-page-router>` element takes up all the space the views will use.

		<cosmoz-page-router class="fit">
			<cosmoz-page-route path="/" template-id="start" import="views/start.js">
			</cosmoz-page-route>
		</cosmoz-page-router>

#### View
		import { PolymerElement, html } from '@polymer/polymer/polymer-element';

		class Start extends PolymerElement {
			static get template() {
				return html`<h2>Welcome to the start page</h2>`;
			}
		}

		customElements.define('start-page', Start);

`Cosmoz.TemplateView` is an object that will link the template with ID `start`
to this Polymer object named `start`.

The object itself will be mixed in like any other custom element / template.

The template has `is="dom-bind"` to hand over the stamping, listeners, bindings
and other to Polymer once inserted.

For ad-hoc routing, `url-prefix` + `url` + `file-suffix` will be used to find
the template file. The template id will be the url path with slashes (/)
replaced with dashes (-), `users/list/all` -> `users-list-all`.

### View events

Fired on the template

#### `attached`

Fired by Polymer, do not override in view.

#### `ready`

Fired by Polymer.

A good time to do any setup if needed for the view.

#### `template-activate`

Will be fired for newly imported templates when Polymer fires the `dom-change` event.

Will otherwise be fired when activated for persisted views.

@group Cosmoz Elements
@element cosmoz-page-router
@demo demo/index.html
*/
class CosmozPageRouter extends PolymerElement {
	static get template() {
		return html`
		<style>
			#routes {
				@apply --layout-fit;
			}
			::slotted(:not(.active-route)) {
				display: none;
			}
		</style>
		<div id="routes">
			<slot></slot>
		</div>
`;
	}

	constructor() {
		super();
		this._currentRoute = null;
		this._initialized = false;
		this._previousRoute = null;
		this._previousUrl = null;
		this._routesInError = null;
		this._boundStateChange = this._stateChange.bind(this);
	}
	/**
	 * Get component name.
	 *
	 * @returns {string} Name.
	 */
	static get is() {
		return 'cosmoz-page-router';
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
				value: '.js'
			},
			/* `hash` , `hashbang` , `pushstate` or `auto` */
			mode: {
				type: String,
				value: 'auto'
			},
			/* Don't run `initialize` on `ready` */
			manualInit: {
				type: Boolean,
				value: false
			},
			/* Don't create ad-hoc routes but instead fire a `not-found` event */
			noAdHoc: {
				type: Boolean,
				value: false
			},
			/* Don't empty `cosmoz-page-route` element when navigating from a route, persisting it. */
			persist: {
				type: Boolean,
				value: false
			},
			typecast: {
				type: String,
				value: 'auto'
			},
			/* Anything to prefix ad-hoc routes with, be it a `views` folder or a different domain */
			urlPrefix: {
				type: String,
				value: ''
			}
		};
	}

	connectedCallback() {
		super.connectedCallback();
		[
			'template-activate',
			'template-created',
			'template-ready'
		].forEach(e => this.addEventListener(e, stopPropagation));
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		[
			'template-activate',
			'template-created',
			'template-ready'
		].forEach(e => this.removeEventListener(e, stopPropagation));
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
		return this.dispatchEvent(new CustomEvent(
			type,
			{
				bubbles: !!bubbles,
				cancelable: true,
				composed: true,
				detail
			}
		));
	}
	/**
	 * Adds event listener to `popstate` event
	 *
	 * @returns {void}
	 */
	initialize() {
		if (this._initialized) {
			return;
		}

		window.addEventListener('popstate', this._boundStateChange);
		this._boundStateChange();
		this._initialized = true;
	}

	ready() {
		super.ready();
		this._routesInError = {};
		if (!this.manualInit) {
			microTask.run(() => this.initialize());
		}
	}

	go(path, options) {
		let _path = path;

		if (this.mode !== 'pushstate') {
			// mode == auto, hash or hashbang
			if (this.mode === 'hashbang') {
				_path = '#!' + _path;
			} else {
				_path = '#' + _path;
			}
		}
		if (options && options.replace === true) {
			window.history.replaceState(null, null, _path);
		} else {
			window.history.pushState(null, null, _path);
		}

		// dispatch a popstate event
		window.dispatchEvent(new CustomEvent(
			'popstate',
			{
				bubbles: false,
				composed: true,
				detail: {
					state: {}
				}
			}
		));
	}

	// eslint-disable-next-line max-statements
	_stateChange() {
		const url = utils.parseUrl(window.location.href, this.mode),
			eventDetail = {
				path: url.path
			};
		let errorEvent,
			route;

		// don't load a new route if only the hash fragment changed
		if (
			this._previousUrl &&
			url.path === this._previousUrl.path &&
			url.search === this._previousUrl.search &&
			url.isHashPath === this._previousUrl.isHashPath
		) {
			this._previousUrl = url;
			return;
		}

		this._previousUrl = url;

		// fire a state-change event on the app-router and return early if the user called event.preventDefault()
		if (!this._fireEvent('state-change', eventDetail)) {
			return;
		}

		if (this._routesInError[url.path]) {
			errorEvent = this._routesInError[url.path];
			this._fireEvent('import-error', errorEvent);
			return;
		}

		// find the first matching route
		route = this.firstChild;
		while (route) {
			if (route.tagName === 'COSMOZ-PAGE-ROUTE' && utils.testRoute(route.path, url.path)) {
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

		this._addAdHocRoute(url.path);
	}

	_addAdHocRoute(path) {
		const importUri = this.urlPrefix + path + this.fileSuffix,
			templateId = path.substring(1).replace(/\//ug, '-');

		this._addRouteForCurrentPathAndActivate(importUri, templateId);
	}

	_addRouteForCurrentPathAndActivate(importUri, templateId) {
		const url = utils.parseUrl(window.location.href, this.mode),
			route = this.addRoute({
				import: importUri,
				path: url.path,
				persist: this.persist,
				templateId
			});

		this._activateRoute(route, url);
	}

	/**
	 * Add a `cosmoz-page-route` element
	 * @param {Object} route { persist: Boolean, templateId: 'Route template-id', import: 'Route import', path: 'Route path' }
	 * @returns {void}
	 */
	addRoute(route) {
		const element = document.createElement('cosmoz-page-route');
		element.setAttribute('path', route.path);
		if (route.persist) {
			element.setAttribute('persist', '');
		}
		element.setAttribute('template-id', route.templateId);
		element.setAttribute('import', route.import);

		this._fireEvent('before-add-route', {
			route: element
		}, true);

		const newRoute = this.appendChild(element);
		flush();
		return newRoute;
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
		route.deactivate();
		const parent = route.parentNode;
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

		// if we're on the same route then update the model but don't replace the page content
		if (route === this._activeRoute || route.imported && route.persist) {
			this._updateModelAndActivate(route, url, eventDetail);
		} else if (route.import) {
			// import custom element or template
			this._importAndActivate(route, url, eventDetail);
		}
	}

	_updateModelAndActivate(route, url, eventDetail) {
		const model = this._createModel(route, url, eventDetail);

		eventDetail.templateInstance = route.templateInstance;
		Object.assign(route.templateInstance, model);
		this._fireEvent('template-activate', eventDetail, true);
	}

	// eslint-disable-next-line max-statements, max-lines-per-function
	_importAndActivate(route, url, eventDetail) {
		const importUri = route.import,
			importLoadedCallback = () => {
				route.imported = true;
				this._activateImport(route, url, eventDetail);
			},
			importErrorCallback = e => {
				const importErrorEvent = {
					route,
					errorEvent: e
				};
				this._routesInError[importUri] = importErrorEvent;
				this._fireEvent('import-error', importErrorEvent);
			};

		this._fireEvent('route-loading', eventDetail);
		return import(importUri)
			.catch(importErrorCallback)
			.then(importLoadedCallback);
	}

	_hasCustomElement(elementName) {
		return customElements.get(elementName) != null;
	}

	// eslint-disable-next-line max-statements
	_activateImport(route, url, eventDetail) {
		// make sure the user didn't navigate to a different route while it loaded
		if (route !== this._loadingRoute) {
			return;
		}

		if (this._hasCustomElement(route.templateId)) {
			return this._activateCustomElement(route, url, eventDetail);
		}

		throw new Error('Could not activate route.');
	}

	_activateCustomElement(route, url, eventDetail) {
		const element = document.createElement(route.templateId);

		eventDetail.templateInstance = element;
		route.templateInstance = element;

		this._fireEvent('template-created', eventDetail, true);

		const model = this._createModel(route, url, eventDetail);

		Object.assign(eventDetail.templateInstance, model);

		this._fireEvent('template-ready', eventDetail, true);

		this._loadingRoute.appendChild(element);

		// FIXME: Change route after element ready()
		this._changeRoute();

		if (this._previousRoute) {
			this._previousRoute.deactivate();
		}

		this._fireEvent('template-activate', eventDetail, true);
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
		}
		this._activeRoute.classList.add('active-route');

		if (oRoute) {
			oRoute.active = false;
		}

		nRoute.active = true;
	}

	_createModel(route, url, eventDetail) {
		const model = {},
			params = utils.routeArguments(
				route.path,
				url.path,
				url.search,
				!!route.regex,
				this.typecast === 'auto'
			);

		model.params = params;

		if (!!route.bindRouter || !!this.bindRouter) {
			model.router = this;
		}

		eventDetail.model = model;
		this._fireEvent('before-data-binding', eventDetail);
		return eventDetail.model;
	}
}

customElements.define(CosmozPageRouter.is, CosmozPageRouter);

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
