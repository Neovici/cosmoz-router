import { html, component } from '@pionjs/pion';

customElements.define(
	'param-reading-view',
	component(({ p1, p2 }) => html` p1: ${p1}; p2: ${p2}`)
);
