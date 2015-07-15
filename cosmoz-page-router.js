/*global Cosmoz, Polymer, document, window */

(function () {
	"use strict";

	// HACK: this is to keep jslint quiet
	var polymer = Polymer;

	polymer({
		is: 'cosmoz-page-router',

		behaviors: [
			Cosmoz.PageRouterUtilitiesBehavior
		],

		properties: {
			fileSuffix: {
				type: String,
				value: '.html'
			},
			mode: {
				type: String,
				value: 'auto'
			},
			noAdHoc: {
				type: Boolean,
				value: false
			},
			persist: {
				type: Boolean,
				value: false
			},
			typecast: {
				type: String,
				value: 'auto'
			},
			urlPrefix: {
				type: String,
				value: ''
			}
		},
		_currentRoute: null,
		_importedUris: null,
		_previousRoute: null,
		_previousUrl: null,
		_routesInError: null,

		listeners: {
			'neon-animation-finish': '_onNeonAnimationFinish',
			'template-activate': '_stopEventPropagation',
			'template-created': '_stopEventPropagation',
			'template-ready': '_stopEventPropagation'
		},

		/**
		* Utility function that fires an event from a polymer element and return false if preventDefault has been called on the event.
		*/
		_fireEvent: function (type, detail, node, bubbles) {
			return !this.fire(type, detail, {
				bubbles: !!bubbles,
				cancelable: true,
				node: node || this
			}).defaultPrevented;
		},

		initialize: function () {
			if (this.isInitialized) {
				return;
			}

			var boundStateChangeHandler = this._stateChange.bind(this);
			window.addEventListener('popstate', boundStateChangeHandler);
			boundStateChangeHandler();
		},

		ready: function () {
			this._importedUris = {};
			this._routesInError = {};
		},

		go: function (path, options) {
			if (this.mode !== 'pushstate') {
				// mode == auto, hash or hashbang
				if (this.mode === 'hashbang') {
					path = '#!' + path;
				} else {
					path = '#' + path;
				}
			}
			if (options && options.replace === true) {
				window.history.replaceState(null, null, path);
			} else {
				window.history.pushState(null, null, path);
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
					url.hash !== this._previousUrl.hash &&
					url.path === this._previousUrl.path &&
					url.search === this._previousUrl.search &&
					url.isHashPath === this._previousUrl.isHashPath) {
				this._scrollToHash(url.hash);
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
			route = this.$.routes.firstElementChild;
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

			this._fireEvent('route-loading', eventDetail);
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
				routeElement = document.createElement("cosmoz-page-route"),
				route;

			routeElement.setAttribute('path', url.path);
			if (this.persist) {
				routeElement.setAttribute('persist', '');
			}
			routeElement.setAttribute('template-id', templateId);
			routeElement.setAttribute('import', importUri);
			route = Polymer.dom(this.$.routes).appendChild(routeElement);
			this._activateRoute(route, url);
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
			if (route === this._activeRoute || (route.imported && route.persist)) {
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

		_importAndActivate: function (route, url, eventDetail) {
			var
				router = this,
				importLink,
				importUri = route.import,
				importLoadedCallback = function (e) {
					importLink.loaded = true;
					route.imported = true;
					router._activateImport(route, url, eventDetail, importLink);
				},
				importErrorCallback = function (e) {
					var	importErrorEvent = {
						route: route,
						errorEvent: e
					};

					importLink.notFound = true;
					this._routesInError[importUri] = importErrorEvent;
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
				document.head.appendChild(importLink);
				this._importedUris[importUri] = importLink;
			} else {
				// previously imported. this is an async operation and may not be complete yet.
				importLink = this._importedUris[importUri];
				if (importLink.notFound) {
					importErrorCallback(null, route);
				} else if (!importLink.loaded) {
					importLink.addEventListener('load', importLoadedCallback);
					importLink.addEventListener('error', importErrorCallback);
				} else {
					this._activateImport(route, url, eventDetail, importLink);
				}
			}
		},

		_activateImport: function (route, url, eventDetail, importLink) {
			var template;
			route.importLink = importLink;
			// make sure the user didn't navigate to a different route while it loaded
			if (route === this._loadingRoute) {
				template = importLink.import.getElementById(route.templateId);
				if (!template) {
					this._fireEvent('template-not-found', eventDetail);
					return;
				}
				this._activateTemplate(route, url, eventDetail, template);
			}
		},

		_activateTemplate: function (route, url, eventDetail, template) {
			var
				templateInstance = document.importNode(template, true),
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

			if (oldRoute === undefined) {
				oldRoute = this._activeRoute;
			}

			if (newRoute === undefined) {
				newRoute = this._loadingRoute;
			}

			// update references to the activeRoute, previousRoute, and loadingRoute
			this._previousRoute = oldRoute;
			this._activeRoute = newRoute;
			this._loadingRoute = null;

			if (oldRoute) {
				oldRoute.active = false;
			}

			newRoute.active = true;

			this.$.routes.selected = newRoute.path;
		},

		// Remove the route's content
		_deactivateRoute: function (route) {
			var node, nodeToRemove;
			if (route && !route.persist) {
				// remove the route content
				node = Polymer.dom(route.root).firstChild;
				while (node) {
					nodeToRemove = node;
					node = Polymer.dom(node).nextSibling;
					Polymer.dom(route.root).removeChild(nodeToRemove);
				}
			}
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
			console.log('_onNeonAnimationFinish');
			if (this._previousRoute && !this._previousRoute.active) {
				this._deactivateRoute(this._previousRoute);
			}
		},

		_stopEventPropagation: function (event) {
			event.stopPropagation();
		}
	});
}());