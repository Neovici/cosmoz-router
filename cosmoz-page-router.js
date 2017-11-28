// @license Copyright (C) 2015 Erik Ringsmuth - MIT license
// @license Copyright (C) 2015 Neovici AB - Apache 2 License
/*global Cosmoz, Polymer, document, window */

(function () {
	'use strict';

	// Try to detect importNode bug https://github.com/Polymer/polymer/issues/2157

	var hasImportNodeBug = false;

	/*	currentScript = document._currentScript || document.currentScript,
		currentDocument = currentScript.ownerDocument,
		testImportLink = currentDocument.querySelector('link[rel="import"][href="detect-import-node-bug.html"]'),
		testTemplate = testImportLink.import.querySelector('template'),
		clonedTemplate = document.importNode(testTemplate, true);

	if (!clonedTemplate.content || clonedTemplate.content.childNodes.length === 0) {
		hasImportNodeBug = true;
	} */

	// Leave a blank comment before Polymer declaration so that iron-component-page uses the doc from the .html file
	//
	Polymer({
		is: 'cosmoz-page-router',

		behaviors: [
			Cosmoz.PageRouterUtilitiesBehavior
		],

		properties: {
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
		},
		_currentRoute: null,
		_importedUris: null,
		_initialized: false,
		_previousRoute: null,
		_previousUrl: null,
		_routesInError: null,
		_importLinksListeners: null,

		listeners: {
			'neon-animation-finish': '_onNeonAnimationFinish',
			'template-activate': '_stopEventPropagation',
			'template-created': '_stopEventPropagation',
			'template-ready': '_stopEventPropagation'
		},

		/**
		* Utility function that fires an event from a polymer element and return false if preventDefault has been called on the event.
		* @param {String} type The event type
		* @param {Object} detail The event detail
		* @param {HTMLElement} node The node that will fire the event
		* @param {Boolean} bubbles True if event should bubble
		* @return {Boolean} `true` = continue, `false` = prevent further actions
		*/
		_fireEvent: function (type, detail, node, bubbles) {
			return !this.fire(type, detail, {
				bubbles: !!bubbles,
				cancelable: true,
				node: node || this
			}).defaultPrevented;
		},

		/**
		 * Adds event listener to `popstate` event
		 * @returns {void}
		 */
		initialize: function () {
			if (this._initialized) {
				return;
			}

			var boundStateChangeHandler = this._stateChange.bind(this);
			window.addEventListener('popstate', boundStateChangeHandler);
			boundStateChangeHandler();
			this._initialized = true;
		},

		ready: function () {
			this._importedUris = {};
			this._routesInError = {};
			this._importLinksListeners = {};
			if (!this.manualInit) {
				this.async(this.initialize);
			}
		},

		go: function (path, options) {
			var _path = path;

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
			this.fire('popstate', {
				state: {}
			}, {
				node: window,
				bubbles: false
			});
		},

		// scroll to the element with id="hash" or name="hash"
		_scrollToHash: function (hash) {
			if (!hash) {
				return;
			}

			// wait for the browser's scrolling to finish before we scroll to the hash
			// ex: http://example.com/#/page1#middle
			// the browser will scroll to an element with id or name `/page1#middle` when the page finishes loading. if it doesn't exist
			// it will scroll to the top of the page. let the browser finish the current event loop and scroll to the top of the page
			// before we scroll to the element with id or name `middle`.
			setTimeout(function () {
				var hashElement = document.querySelector('html /deep/ ' + hash) || document.querySelector('html /deep/ [name="' + hash.substring(1) + '"]');
				if (hashElement && hashElement.scrollIntoView) {
					hashElement.scrollIntoView(true);
				}
			}, 0);
		},

		_stateChange: function () {

			var
				url = this.parseUrl(window.location.href, this.mode),
				eventDetail = {
					path: url.path
				},
				errorEvent,
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
			route = Polymer.dom(this).firstElementChild;
			while (route) {
				if (route.tagName === 'COSMOZ-PAGE-ROUTE' && this.testRoute(route.path, url.path)) {
					this._activateRoute(route, url);
					return;
				}
				route = Polymer.dom(route).nextSibling;
			}

			eventDetail.url = url;

			if (this.noAdHoc) {
				this._fireEvent('not-found', eventDetail);
				return;
			}

			this._addAdHocRoute(url.path);
		},

		_addAdHocRoute: function (path) {
			var
				importUri = this.urlPrefix + path + this.fileSuffix,
				templateId = path.substring(1).replace(/\//g, '-');

			this._addRouteForCurrentPathAndActivate(importUri, templateId);
		},

		_addRouteForCurrentPathAndActivate: function (importUri, templateId) {
			var
				url = this.parseUrl(window.location.href, this.mode),
				route = this.addRoute({
					import: importUri,
					path: url.path,
					persist: this.persist,
					templateId: templateId
				});

			this._activateRoute(route, url);
		},

		/**
		 * Add a `cosmoz-page-route` element
		 * @param {Object} route { persist: Boolean, templateId: 'Route template-id', import: 'Route import', path: 'Route path' }
		 * @returns {void}
		 */
		addRoute: function (route) {
			var
				element = document.createElement('cosmoz-page-route'),
				newRoute,
				dom = Polymer.dom(this);
			element.setAttribute('path', route.path);
			if (route.persist) {
				element.setAttribute('persist', '');
			}
			element.setAttribute('template-id', route.templateId);
			element.setAttribute('import', route.import);

			this._fireEvent('before-add-route', {
				route: element
			}, this, true);

			newRoute = dom.appendChild(element);

			if (dom.flush) {
				dom.flush();
			}

			return newRoute;
		},

		_activateRoute: function (route, url) {
			if (route.redirect) {
				this.go(route.redirect, {
					replace: true
				});
				return;
			}

			var eventDetail = {
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
		},

		_updateModelAndActivate: function (route, url, eventDetail) {
			var model = this._createModel(route, url, eventDetail);

			eventDetail.templateInstance = route.templateInstance;
			this._setObjectProperties(route.templateInstance, model);
			this._fireEvent('template-activate', eventDetail, route.templateInstance, true);
		},

		_removeImportLinkListeners: function (importLink) {
			var listeners = this._importLinksListeners[importLink];
			if (listeners) {
				importLink.removeEventListener('load', listeners.load);
				importLink.removeEventListener('error', listeners.error);
				this._importLinksListeners[importLink] = null;
			}
		},

		_importAndActivate: function (route, url, eventDetail) {
			var
				router = this,
				importLink,
				importUri = route.import,
				importLoadedCallback = function (e) {
					importLink.loaded = true;
					router._removeImportLinkListeners(importLink);
					route.imported = true;
					router._activateImport(route, url, eventDetail, importLink);
				},
				importErrorCallback = function (e) {
					var	importErrorEvent = {
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
		},

		_hasCustomElement: function (elementName) {
			const customElements = window.customElements;
			return Polymer.telemetry.registrations.some(function (element) {
				return element.is === elementName;
			}) || customElements && customElements.get(elementName) != null;
		},

		_activateImport: function (route, url, eventDetail, importLink) {
			route.importLink = importLink;
			// make sure the user didn't navigate to a different route while it loaded
			if (route === this._loadingRoute) {

				var template = importLink.import.getElementById(route.templateId);

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
		},

		_instantiateTemplate: function (template) {
			if (hasImportNodeBug) {
				return this._fixedImportNode(template);
			}
			return document.importNode(template, true);
		},

		_fixedImportNode: function (node, doc) {
			var clone = document.importNode(node, false);
			clone.innerHTML = node.innerHTML;
			return clone;
		},

		_activateCustomElement: function (route, url, eventDetail) {
			var
				element = document.createElement(route.templateId),
				model,
				router = this;

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

			Polymer.dom(this._loadingRoute.root).appendChild(element);

			// FIXME: Change route after element ready()
			router._changeRoute();

			this._fireEvent('template-activate', eventDetail, route, true);
		},

		_activateTemplate: function (route, url, eventDetail, template) {
			var
				templateInstance = this._instantiateTemplate(template),
				templateId = route.templateId,
				templateViewPrototype,
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
		},

		_activateTemplateInstance: function (route, url, eventDetail) {
			var
				router = this,
				templateInstance = eventDetail.templateInstance;


			templateInstance.addEventListener('dom-change', function (e) {
				router._fireEvent('template-activate', eventDetail, templateInstance, true);
			});

			// Make sure _changeRoute is run for both new and persisted routes
			templateInstance.addEventListener('template-activate', function (e) {
				router._changeRoute();
			});

			// add the new content
			Polymer.dom(this._loadingRoute.root).appendChild(templateInstance);
		},

		_changeRoute: function (oldRoute, newRoute) {
			var oRoute = oldRoute,
				nRoute = newRoute;

			if (oRoute === undefined) {
				oRoute = this._activeRoute;
			}

			if (nRoute === undefined) {
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

			this.$.routes.selected = nRoute.path;
		},

		// Remove the route's content
		_deactivateRoute: function (route) {
			route.deactivate();
		},

		_createModel: function (route, url, eventDetail) {
			var
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
		},

		_setObjectProperties: function (object, model) {
			var property;
			for (property in model) {
				if (model.hasOwnProperty(property)) {
					object[property] = model[property];
				}
			}
		},

		_onNeonAnimationFinish: function (event) {
			if (this._previousRoute && !this._previousRoute.active) {
				this._deactivateRoute(this._previousRoute);
			}
		},

		_stopEventPropagation: function (event) {
			event.stopPropagation();
		}
	});
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
