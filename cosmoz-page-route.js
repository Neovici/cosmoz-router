import '@polymer/iron-flex-layout/iron-flex-layout';

import { PolymerElement, html } from '@polymer/polymer/polymer-element';

import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class';

class CosmozPageRoute extends mixinBehaviors([
	IronResizableBehavior
], PolymerElement) {
	static get template() {
		return html`
	<style>
		:host {
			display: block;
			position: absolute;
			@apply --layout-fit;
			overflow-y: auto;
		}
	</style>

	<slot></slot>
`;
	}

	/**
	 * Get component name.
	 *
	 * @returns {string} Name.
	 */
	static get is() {
		return 'cosmoz-page-route';
	}
	/**
	 * Get component properties.
	 *
	 * @returns {object} Properties.
	 */
	static get properties() {
		return {
			active: Boolean,

			import: {
				type: String
			},

			imported: {
				type: Boolean,
				value: false
			},

			path: {
				type: String
			},

			persist: {
				type: Boolean,
				value: false
			},

			templateId: {
				type: String
			},

			templateInstance: {
				type: Object
			}
		};
	}
	/**
	 * Remove the route node.
	 *
	 * @returns {void}
	 */
	deactivate() {
		let node,
			nodeToRemove;
		if (!this.persist) {
			// remove the route content
			node = this.firstChild;
			while (node) {
				nodeToRemove = node;
				node = node.nextSibling;
				this.removeChild(nodeToRemove);
			}
			this.templateInstance = null;
		}
	}
}

customElements.define(CosmozPageRoute.is, CosmozPageRoute);

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
