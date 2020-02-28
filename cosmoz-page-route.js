import {
	css, html, LitElement
} from 'lit-element/lit-element.js';

class CosmozPageRoute extends LitElement {
	static get styles() {
		return css`
			:host {
				display: block;
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				overflow-y: auto;
			}
		`;
	}

	render() {
		if (this.templateId == null) {
			return;
		}
		this.templateInstance = document.createElement(this.templateId);
		console.log('new render', this.templateId);
		return html`${ this.templateInstance }`;
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
				type: Promise
			},

			path: {
				type: String
			},

			templateId: {
				type: String
			}
		};
	}
}

customElements.define('cosmoz-page-route', CosmozPageRoute);

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
