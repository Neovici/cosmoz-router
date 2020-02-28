import {
	PolymerElement, html
} from '@polymer/polymer/polymer-element';

class DemoHome extends PolymerElement {
	static get template() {
		return html`<h2>Welcome to the home page</h2>`;
	}

	static get is() {
		return 'demo-home';
	}
}

customElements.define(DemoHome.is, DemoHome);
