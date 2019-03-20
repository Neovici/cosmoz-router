// @license Copyright (C) 2015 Erik Ringsmuth - MIT license
// @license Copyright (C) 2015 Neovici AB - Apache 2 License
/*global Cosmoz, Polymer, document, window */

(function () {
	'use strict';

	const stopPropagation = e => e.stopPropagation();

	// Leave a blank comment before Polymer declaration so that iron-component-page uses the doc from the .html file
	//
	class CosmozPageRouter extends Cosmoz.PageRouterUtilitiesBehavior(Polymer.Element) {
		constructor() {
			super();
			this._currentRoute = null;
			this._importedUris = null;
			this._initialized = false;
			this._previousRoute = null;
			this._previousUrl = null;
			this._routesInError = null;
			this._importLinksListeners = null;
			this._boundOnNeonAnimationFinish =  this._onNeonAnimationFinish.bind(this);
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
					value: '.html'
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
			this.addEventListener('neon-animation-finish', this._boundOnNeonAnimationFinish);
			[
				'template-activate',
				'template-created',
				'template-ready'
			].forEach(e => this.addEventListener(e, stopPropagation));
		}

		disconnectedCallback() {
			super.disconnectedCallback();
			this.removeEventListener('neon-animation-finish', this._boundOnNeonAnimationFinish);
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
		* @param {HTMLElement} node The node that will fire the event
		* @param {Boolean} bubbles True if event should bubble
		* @return {Boolean} `true` = continue, `false` = prevent further actions
		*/
		_fireEvent(type, detail, node, bubbles) {
			return !this.dispatchEvent(new CustomEvent(
				type,
				{
					bubbles: !!bubbles,
					cancelable: true,
					composed: true,
					detail,
					node: node || this
				}
			)).defaultPrevented;
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
			this._importedUris = {};
			this._routesInError = {};
			this._importLinksListeners = {};
			if (!this.manualInit) {
				Polymer.Async.microTask.run(() => this.initialize());
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
		/**
		 * Scroll to the element with id="hash" or name="hash".
		 *
		 * @param {string} hash Hash to scroll to.
		 * @returns {void}
		 */
		_scrollToHash(hash) {
			if (!hash) {
				return;
			}

			// wait for the browser's scrolling to finish before we scroll to the hash
			// ex: http://example.com/#/page1#middle
			// the browser will scroll to an element with id or name `/page1#middle` when the page finishes loading. if it doesn't exist
			// it will scroll to the top of the page. let the browser finish the current event loop and scroll to the top of the page
			// before we scroll to the element with id or name `middle`.
			setTimeout(() => {
				const hashElement = document.querySelector('html /deep/ ' + hash) || document.querySelector('html /deep/ [name="' + hash.substring(1) + '"]');
				if (hashElement && hashElement.scrollIntoView) {
					hashElement.scrollIntoView(true);
				}
			}, 0);
		}

		_stateChange() {

			const
				url = this.parseUrl(window.location.href, this.mode),
				eventDetail = {
					path: url.path
				};
			let errorEvent,
				route;

			// don't load a new route if only the hash fragment changed
			if (this._previousUrl &&
					url.path === this._previousUrl.path &&
					url.search === this._previousUrl.search &&
					url.isHashPath === this._previousUrl.isHashPath) {
				// this._scrollToHash(url.hash);
				this._previousUrl = url;
				return;
			}
			this._previousUrl = url;

			// fire a state-change event on the app-router and return early if the user called event.preventDefault()
			if (!this._fireEvent('state-change', eventDetail)) {
				return;
			}

			if (this._routesInError.hasOwnProperty(url.path)) {
				errorEvent = this._routesInError[url.path];
				this._fireEvent('import-error', errorEvent);
				return;
			}

			// find the first matching route
			route = this.firstChild;
			while (route) {
				if (route.tagName === 'COSMOZ-PAGE-ROUTE' && this.testRoute(route.path, url.path)) {
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
				templateId = path.substring(1).replace(/\//g, '-');

			this._addRouteForCurrentPathAndActivate(importUri, templateId);
		}

		_addRouteForCurrentPathAndActivate(importUri, templateId) {
			const
				url = this.parseUrl(window.location.href, this.mode),
				route = this.addRoute({
					import: importUri,
					path: url.path,
					persist: this.persist,
					templateId: templateId
				});

			this._activateRoute(route, url);
		}

		/**
		 * Add a `cosmoz-page-route` element
		 * @param {Object} route { persist: Boolean, templateId: 'Route template-id', import: 'Route import', path: 'Route path' }
		 * @returns {void}
		 */
		addRoute(route) {
			const
				element = document.createElement('cosmoz-page-route');
			let	newRoute;
			element.setAttribute('path', route.path);
			if (route.persist) {
				element.setAttribute('persist', '');
			}
			element.setAttribute('template-id', route.templateId);
			element.setAttribute('import', route.import);

			this._fireEvent('before-add-route', {
				route: element
			}, this, true);

			newRoute = this.appendChild(element);
			Polymer.flush();
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
			this._deactivateRoute(route);
			this.removeChild(route);
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
				route: route,
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
			this._setObjectProperties(route.templateInstance, model);
			this._fireEvent('template-activate', eventDetail, route.templateInstance, true);
		}

		_removeImportLinkListeners(importLink) {
			const listeners = this._importLinksListeners[importLink];
			if (listeners) {
				importLink.removeEventListener('load', listeners.load);
				importLink.removeEventListener('error', listeners.error);
				this._importLinksListeners[importLink] = null;
			}
		}

		_importAndActivate(route, url, eventDetail) {
			let importLink;
			const
				router = this,
				importUri = route.import,
				importLoadedCallback =  () => {
					importLink.loaded = true;
					router._removeImportLinkListeners(importLink);
					route.imported = true;
					router._activateImport(route, url, eventDetail, importLink);
				},
				importErrorCallback = e => {
					const
						importErrorEvent = {
							route: route,
							errorEvent: e
						};

					importLink.notFound = true;
					router._removeImportLinkListeners(importLink);
					router._routesInError[importUri] = importErrorEvent;
					router._fireEvent('import-error', importErrorEvent);
				};

			if (this._importedUris === null) {
				this._importedUris = {};
			}

			if (!this._importedUris.hasOwnProperty(route.import)) {
				importLink = document.createElement('link');
				importLink.setAttribute('rel', 'import');
				importLink.setAttribute('href', importUri);
				importLink.setAttribute('async', 'async');
				importLink.addEventListener('load', importLoadedCallback);
				importLink.addEventListener('error', importErrorCallback);
				importLink.loaded = false;
				this._importLinksListeners[importLink] = {
					load: importLoadedCallback,
					error: importErrorCallback
				};

				document.head.appendChild(importLink);
				this._importedUris[importUri] = importLink;

				this._fireEvent('route-loading', eventDetail);

			} else {
				// previously imported. this is an async operation and may not be complete yet.
				importLink = this._importedUris[importUri];
				if (importLink.notFound) {
					importErrorCallback(null, route);
				} else if (!importLink.loaded) {
					importLink.addEventListener('load', importLoadedCallback);
					importLink.addEventListener('error', importErrorCallback);

					this._fireEvent('route-loading', eventDetail);
				} else {
					this._activateImport(route, url, eventDetail, importLink);
				}
			}
		}

		_hasCustomElement(elementName) {
			return customElements.get(elementName) != null;
		}

		_activateImport(route, url, eventDetail, importLink) {
			route.importLink = importLink;
			// make sure the user didn't navigate to a different route while it loaded
			if (route === this._loadingRoute) {

				if (route.hasCustomElement && this._hasCustomElement(route.templateId)) {
					this._activateCustomElement(route, url, eventDetail);
					return;
				}
				//NOTE: when polyfilled importLink.import is not a Document but querySelector is available
				const template = importLink.import.querySelector('#' + route.templateId);

				if (!template) {
					this._fireEvent('template-not-found', eventDetail);
					return;
				}

				if (template.tagName === 'DOM-MODULE') {
					if (this._hasCustomElement(route.templateId)) {
						this._activateCustomElement(route, url, eventDetail);
						return;
					}
					this._fireEvent('element-not-found', eventDetail);
					return;
				}

				this._activateTemplate(route, url, eventDetail, template);
			}
		}

		_activateCustomElement(route, url, eventDetail) {
			const
				element = document.createElement(route.templateId),
				router = this;
			let model;

			eventDetail.templateInstance = element;
			route.templateInstance = element;

			this._fireEvent('template-created', eventDetail, route, true);

			model = this._createModel(route, url, eventDetail);

			this._setObjectProperties(eventDetail.templateInstance, model);

			this._fireEvent('template-ready', eventDetail, route, true);

			if (this._previousRoute && this._previousRoute.classList.contains('neon-animating')) {
				// When switching fast between routes, previous animation
				// will be cancelled and neon-animation-finished event won't be raised.
				// So we need to do the cleanup that is suposed to be done.
				this._deactivateRoute(this._previousRoute);
			}

			this._loadingRoute.appendChild(element);

			// FIXME: Change route after element ready()
			router._changeRoute();

			this._fireEvent('template-activate', eventDetail, route, true);
		}

		_activateTemplate(route, url, eventDetail, template) {
			const
				templateInstance = document.importNode(template, true),
				templateId = route.templateId;
			let	templateViewPrototype,
				model;

			eventDetail.templateInstance = templateInstance;
			route.templateInstance = templateInstance;

			templateViewPrototype = Cosmoz.TemplateView[templateId];
			if (templateViewPrototype) {
				Polymer.Base.mixin(templateInstance, templateViewPrototype);
			}

			this._fireEvent('template-created', eventDetail, route, true);

			model = this._createModel(route, url, eventDetail);

			this._setObjectProperties(eventDetail.templateInstance, model);

			this._fireEvent('template-ready', eventDetail, route, true);

			this._activateTemplateInstance(route, url, eventDetail);
		}

		_activateTemplateInstance(route, url, eventDetail) {
			const
				router = this,
				templateInstance = eventDetail.templateInstance;


			templateInstance.addEventListener('dom-change', e => {
				router._fireEvent('template-activate', eventDetail, templateInstance, true);
			});

			// Make sure _changeRoute is run for both new and persisted routes
			templateInstance.addEventListener('template-activate', e => {
				router._changeRoute();
			});

			// add the new content
			this._loadingRoute.appendChild(templateInstance);
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

			if (oRoute) {
				oRoute.active = false;
			}

			nRoute.active = true;

			this.shadowRoot.querySelector('#routes').selected = nRoute.path;
		}

		// Remove the route's content
		_deactivateRoute(route) {
			route.deactivate();
		}

		_createModel(route, url, eventDetail) {
			const
				model = {},
				params = this.routeArguments(
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
			this._fireEvent('before-data-binding', eventDetail, route);
			return eventDetail.model;
		}

		_setObjectProperties(object, model) {
			let property;
			for (property in model) {
				if (model.hasOwnProperty(property)) {
					object[property] = model[property];
				}
			}
		}

		_onNeonAnimationFinish(event) {
			if (this._previousRoute && !this._previousRoute.active) {
				this._deactivateRoute(this._previousRoute);
			}
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
}());
