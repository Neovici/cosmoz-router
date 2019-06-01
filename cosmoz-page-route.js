import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import { NeonAnimatableBehavior } from '@polymer/neon-animation/neon-animatable-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class CosmozPageRoute extends mixinBehaviors([
	IronResizableBehavior,
	NeonAnimatableBehavior
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
			animationConfig: {
				value() {
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
			},

			hasCustomElement: {
				type: Boolean,
				value: false
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
