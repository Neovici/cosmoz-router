import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import '../../cosmoz-page-location.js';

class Issue36View extends PolymerElement {
	static get is() {
		return 'issue-36-view';
	}
	static get template() {
		return html`
			<cosmoz-page-location route-hash="{{ _routeHash }}"></cosmoz-page-location>
			<div>Param value:<span>[[ params.param ]]</span>.</div>
		`;
	}
	static get properties() {
		return {
			params: {
				type: Object,
				// eslint-disable-next-line object-shorthand
				observer: function () {
					this.set('_routeHash.hashparam', this.params.param);
				}
			},
			_routeHash: {
				type: Object,
				value: () => ({})
			}
		};
	}
}
customElements.define(Issue36View.is, Issue36View);
