// @license Copyright (C) 2015 Neovici AB - Apache 2 License
/*global Polymer, page, document */
(function () {
	"use strict";

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
			import: String,
			imported: {
				type: Boolean,
				value: false
			},
			path: String,
			persist: {
				type: Boolean,
				value: false
			},
			templateId: String,
			templateInstance: Object
		},
		behaviors: [
			Polymer.IronResizableBehavior,
			Polymer.NeonAnimatableBehavior
		]
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