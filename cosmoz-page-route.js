// @license Copyright (C) 2015 Neovici AB - Apache 2 License
/*global Polymer, page, document */
(function () {
	"use strict";
	// HACK: this is to keep jslint quiet
	var polymer = Polymer;

	polymer({
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
			Polymer.NeonAnimatableBehavior
		]
	});
}());