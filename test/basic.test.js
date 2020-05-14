import {
	assert, html, fixtureSync, oneEvent, nextFrame
} from '@open-wc/testing';
import { mock } from 'sinon';

import {
	createElement, navigate, documentUrl
} from '../lib/use-routes';
import { hashbang } from '../lib/match.js';

/* eslint-disable max-lines-per-function */
suite('cosmoz-page-router', () => {
	const routes = [
		{
			rule: /^\/$/u,
			handle: () => import('../demo/views/home.js').then(() => createElement('demo-home'))
		},
		{
			rule: hashbang(/^\/view-1/u),
			handle: () => import('../demo/views/view-1.js').then(() => createElement('view-1'))
		},
		{
			rule: hashbang(/^\/param-reading-view/u),
			handle: result => import('../demo/views/param-reading-view.js').then(() => createElement('param-reading-view', Object.fromEntries(result.match.url.searchParams.entries())))
		},
		{
			rule: hashbang(/^\/error/u),
			handle: () => Promise.reject(new Error('testing'))
		}
	];
	let url;

	suiteSetup(async () => {
		url = documentUrl();
		await import('../cosmoz-page-router.js');
	});
	suiteTeardown(() => navigate(url, { notify: false }));

	test('renders home', async () => {
		navigate('/');
		const router = fixtureSync(html`<cosmoz-page-router .routes=${routes} />`);
		await oneEvent(router, 'route-loaded');
		await nextFrame();
		assert.shadowDom.equal(router, '<demo-home></demo-home>');
	});

	test('renders view-1', async () => {
		navigate('#!/view-1');
		const router = fixtureSync(html`<cosmoz-page-router .routes=${routes} />`);
		await oneEvent(router, 'route-loaded');
		await nextFrame();
		assert.shadowDom.equal(router, '<view-1></view-1>');
	});

	test('renders not-found', async () => {
		navigate('#/not-found');
		const router = fixtureSync(html`<cosmoz-page-router .routes=${routes} />`);
		await oneEvent(router, 'route-not-found');
		await nextFrame();
		assert.shadowDom.equal(router, '');
	});

	test('renders home, then view-1', async () => {
		navigate('/');
		const router = fixtureSync(html`<cosmoz-page-router .routes=${routes} />`);
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
		const router = fixtureSync(html`<cosmoz-page-router .routes=${routes} />`),
			{ detail } = await oneEvent(router, 'route-error');
		assert.equal(detail.error.message, 'testing');
	});

	test('params', async () => {
		navigate('#!/param-reading-view?p1=1&p2=2');
		const router = fixtureSync(html`<cosmoz-page-router .routes=${routes} />`);
		await oneEvent(router, 'route-loaded');
		await nextFrame();
		assert.shadowDom.equal(router.shadowRoot.querySelector('param-reading-view'), 'p1: 1; p2: 2');
	});
});

suite('use-routes', () => {
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
			notify: false
		});
		assert(pushState.withArgs(null, '', '/das'));

		historyMock.restore();
	});
});
