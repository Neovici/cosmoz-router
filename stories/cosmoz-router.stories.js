import { html, component } from 'haunted';
import { hashbang, createElement } from '../src/index.ts';

export default {
	title: 'Cosmoz Router',
};

customElements.define(
	'demo-router',
	component(() => {
		const routes = [
			{
				rule: hashbang(/^\/$/u),
				handle: () =>
					import('./views/home.js').then(() => createElement('demo-home')),
			},
			{
				rule: hashbang(/^\/view-1/u),
				handle: () =>
					import('./views/view-1.js').then(() => createElement('view-1')),
			},
			{
				rule: hashbang(/^\/view-2/u),
				handle: () =>
					import('./views/view-2.js').then(() => createElement('view-2')),
			},
			{
				rule: hashbang(/^\/view-3/u),
				handle: () =>
					import('./views/view-3.js').then(() => createElement('view-3')),
			},
		];
		return html`<cosmoz-router .routes=${routes} />`;
	})
);

const Router = () => `
		<style>
			#content {
				display: flex;
				flex-direction: column;
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
			}
			#view {
				flex: 1;
				flex-basis: 0.000000001px;
				position: relative;
				display: block;
			}

			#appRouter {
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
			}
		</style>
		<div id="content">
			<h1>cosmoz-page-router test</h1>
			<ul>
				<li><a href="#!/" target="_self">/Home</a></li>
				<li><a href="#!/view-1" target="_self">/view-1</a></li>
				<li><a href="#!/view-2" target="_self">/view-2</a></li>
				<li><a href="#!/view-3" target="_self">/view-3</a></li>
			</ul>

			<div id="view">
				<demo-router />
			</div>
		</div>`;

export { Router };
