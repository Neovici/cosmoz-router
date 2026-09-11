import {
	assert,
	fixtureSync,
	html,
	nextFrame,
	oneEvent,
} from '@open-wc/testing';
import { mock } from 'sinon';

import { createElement, load } from '../src/load';
import { hashbang } from '../src/match';
import { Route } from '../src/use-router';
import { documentUrl, ignoreNextPopState, navigate } from '../src/use-routes';

suite('cosmoz-router', () => {
	let routes: Route[];
	let url: string;

	suiteSetup(async () => {
		url = documentUrl();
		await import('../src/router');
		routes = [
			{
				rule: /^\/$/u,
				handle: () =>
					import('../stories/views/home.js').then(() =>
						createElement('demo-home'),
					),
			},
			{
				rule: hashbang(/^\/view-1/u),
				handle: load(() => import('../stories/views/view-1.js'), 'view-1'),
			},
			{
				rule: hashbang(/^\/param-reading-view/u),
				handle: (result) =>
					import('../stories/views/param-reading-view.js').then(() => {
						const entries = result.match.url?.searchParams?.entries();
						return createElement(
							'param-reading-view',
							entries ? Object.fromEntries(entries) : {},
						);
					}),
			},
			{
				rule: hashbang(/^\/error/u),
				handle: () => Promise.reject(new Error('testing')),
			},
		];
	});

	suiteTeardown(() => navigate(url, null, { notify: false }));

	test('renders home', async () => {
		navigate('/');
		const router = fixtureSync(html`<cosmoz-router .routes=${routes} />`);
		await oneEvent(router, 'route-loaded');
		await nextFrame();
		assert.shadowDom.equal(router, '<demo-home></demo-home>');
	});

	test('renders view-1', async () => {
		navigate('#!/view-1');
		const router = fixtureSync(html`<cosmoz-router .routes=${routes} />`);
		await oneEvent(router, 'route-loaded');
		await nextFrame();
		assert.shadowDom.equal(router, '<view-1></view-1>');
	});

	test('renders not-found', async () => {
		navigate('#/not-found');
		const router = fixtureSync(html`<cosmoz-router .routes=${routes} />`);
		await oneEvent(router, 'route-not-found');
		await nextFrame();
		assert.shadowDom.equal(router, '');
	});

	test('renders home, then view-1', async () => {
		navigate('/');
		const router = fixtureSync(html`<cosmoz-router .routes=${routes} />`);
		await oneEvent(router, 'route-loaded');
		await nextFrame();
		assert.shadowDom.equal(router, '<demo-home></demo-home>');

		navigate('#!/view-1');
		await oneEvent(router, 'route-loaded');
		await nextFrame();
		assert.shadowDom.equal(router, '<view-1></view-1>');
	});

	test('error', async () => {
		navigate('#!/error');
		const router = fixtureSync(html`<cosmoz-router .routes=${routes} />`),
			{ detail } = await oneEvent(router, 'route-error');
		assert.equal(detail.error.message, 'testing');
	});

	test('params', async () => {
		navigate('#!/param-reading-view?p1=1&p2=2');
		const router = fixtureSync(html`<cosmoz-router .routes=${routes} />`);
		await oneEvent(router, 'route-loaded');
		await nextFrame();
		assert.shadowDom.equal(
			router.shadowRoot?.querySelector('param-reading-view'),
			'p1: 1; p2: 2',
		);
	});
});

suite('use-routes', () => {
	let routes: Route[];

	setup(() => {
		routes = [
			{
				rule: /^\/$/u,
				handle: () => createElement('demo-home'),
			},
			{
				rule: hashbang(/^\/view-1/u),
				handle: () => createElement('view-1'),
			},
		];
	});

	test('createElement', () => {
		assert.throws(() => createElement('definetly-undefined'));
	});

	test('navigate', () => {
		const historyMock = mock(history),
			replaceState = historyMock.expects('replaceState'),
			pushState = historyMock.expects('pushState');

		navigate('/asd');
		assert(replaceState.withArgs(null, '', '/asd'));

		navigate('/das', null, {
			replace: false,
			notify: false,
		});
		assert(pushState.withArgs(null, '', '/das'));

		historyMock.restore();
	});

	test('ignores one matching popstate', async () => {
		navigate('/');
		const router = fixtureSync(html`<cosmoz-router .routes=${routes} />`);
		await oneEvent(router, 'route-loaded');
		await nextFrame();

		navigate('#!/view-1', { overlay: true }, { notify: false });
		ignoreNextPopState((event) => event.state?.overlay === true);
		window.dispatchEvent(
			new PopStateEvent('popstate', { state: { overlay: true } }),
		);
		await nextFrame();
		assert.shadowDom.equal(router, '<demo-home></demo-home>');

		window.dispatchEvent(new PopStateEvent('popstate'));
		await oneEvent(router, 'route-loaded');
		await nextFrame();
		assert.shadowDom.equal(router, '<view-1></view-1>');
	});

	test('cancels an ignored popstate', async () => {
		navigate('/');
		const router = fixtureSync(html`<cosmoz-router .routes=${routes} />`);
		await oneEvent(router, 'route-loaded');
		await nextFrame();

		navigate('#!/view-1', null, { notify: false });
		const cancel = ignoreNextPopState();
		cancel();
		window.dispatchEvent(new PopStateEvent('popstate'));
		await oneEvent(router, 'route-loaded');
		await nextFrame();
		assert.shadowDom.equal(router, '<view-1></view-1>');
	});
});
