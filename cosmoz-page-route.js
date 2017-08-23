// @license Copyright (C) 2015 Neovici AB - Apache 2 License
(function () {
	'use strict';

	Polymer({
		is: 'cosmoz-page-route',
		properties: {
			active: Boolean,
			animationConfig: {
				value: function () {
					return {
						entry: {
							name: 'fade-in-animation',
							node: this,
							timing: {
								duration: 150
							}
						},
						exit: {
							name: 'fade-out-animation',
							node: this,
							timing: {
								duration: 150
							}
						}
					};
				}
			},

			import: {
				type: String,
			},

			imported: {
				type: Boolean,
				value: false
			},

			path: {
				type: String,
			},

			persist: {
				type: Boolean,
				value: false
			},

			templateId: {
				type: String,
			},

			templateInstance: {
				type: Object
			}
		},

		behaviors: [
			Polymer.IronResizableBehavior,
			Polymer.NeonAnimatableBehavior
		],

		deactivate: function () {
			var node,
				nodeToRemove;
			if (!this.persist) {
				// remove the route content
				node = Polymer.dom(this.root).firstChild;
				while (node) {
					nodeToRemove = node;
					node = Polymer.dom(node).nextSibling;
					Polymer.dom(this.root).removeChild(nodeToRemove);

				}
				this.templateInstance = null;
			}
		}
	});

	/**
	 * Fired when the template node has been imported and mixed in with its template object.
	 * Could be used to inject common template behaviors or properties.
	 *
	 * @event template-created
	 * @param {{
			path: url.path,
			route: route,
			oldRoute: this._activeRoute
		}} detail
	 */


	/**
	 * Fired when model with `params` is injected into the template instance.
	 *
	 * @event template-ready
	 * @param {{
			path: url.path,
			route: route,
			oldRoute: this._activeRoute
		}} detail
	 */
}());
