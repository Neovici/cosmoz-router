import {
	PolymerElement, html
} from '@polymer/polymer/polymer-element';

class ParamReadingView extends PolymerElement {
	static get template() {
		return html`p1: [[ p1 ]]; p2: [[ p2 ]]`;
	}
}

customElements.define('param-reading-view', ParamReadingView);
