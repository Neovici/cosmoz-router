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
		return html`${ this.templateInstance }`;
	}

	/**
	 * Get component properties.
	 *
	 * @returns {object} Properties.
	 */
	static get properties() {
		return {
			path: {
				type: String
			},
			persist: {
				type: Boolean
			},
			templateId: {
				type: String,
				attribute: 'template-id'
			}
		};
	}
}

customElements.define('cosmoz-page-route', CosmozPageRoute);
