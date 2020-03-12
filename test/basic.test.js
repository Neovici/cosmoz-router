import {
	assert, html, fixtureSync, oneEvent, nextFrame
} from '@open-wc/testing';
import {
	stub, mock
} from 'sinon';

import {
	createElement, navigate, fromSearch
} from '../lib/use-routes';

/* eslint-disable max-lines-per-function */
suite('cosmoz-page-router', () => {
	const routes = [
		{
			rule: /^\/$/u,
			handle: () => import('../demo/views/home.js').then(() => createElement('demo-home'))
		},
		{
			rule: /^\/view-1/u,
			handle: () => import('../demo/views/view-1.js').then(() => createElement('view-1'))
		},
		{
			rule: /^\/error/u,
			handle: () => Promise.reject(new Error('testing'))
		}
	];

	suiteSetup(async () => {
		await import('../cosmoz-page-router.js');
	});

	test('renders home', async () => {
		const router = fixtureSync(html`<cosmoz-page-router .routes=${routes} />`);
		await oneEvent(router, 'route-loaded');
		await nextFrame();
		assert.shadowDom.equal(router, '<demo-home></demo-home>');
	});

	test('renders home, then view-1', async () => {
		const mapUrl = { from: stub() };
		mapUrl.from.onCall(0).returns(new URL('/', 'http://t').toString());
		mapUrl.from.onCall(1).returns(new URL('/view-1', 'http://t').toString());

		const router = fixtureSync(html`<cosmoz-page-router .routes=${routes} .mapUrl=${mapUrl} />`);
		await oneEvent(router, 'route-loaded');
		await nextFrame();
		assert.shadowDom.equal(router, '<demo-home></demo-home>');

		window.dispatchEvent(new CustomEvent('popstate'));

		await oneEvent(router, 'route-loaded');
		await nextFrame();
		assert.shadowDom.equal(router, '<view-1></view-1>');

	});

	test('non-found', async () => {
		const mapUrl = { from: stub() };
		mapUrl.from.returns(new URL('/not-found', 'http://t').toString());
		const router = fixtureSync(html`<cosmoz-page-router .routes=${routes} .mapUrl=${mapUrl} />`);
		await oneEvent(router, 'route-not-found');
		await nextFrame();
		assert.shadowDom.equal(router, '');
	});

	test('error', async () => {
		const mapUrl = { from: stub() };
		mapUrl.from.returns(new URL('/error', 'http://t').toString());
		const router = fixtureSync(html`<cosmoz-page-router .routes=${routes} .mapUrl=${mapUrl} />`),
			{ detail } = await oneEvent(router, 'route-error');
		assert.equal(detail.error.message, 'testing');
	});
});

suite('use-routes', () => {
	test('createElement', () => {
		assert.throws(() => createElement('definetly-undefined'));
	});

	test('fromSearch', () => {
		assert.deepEqual(fromSearch('?a=1&b=c'), {
			a: '1',
			b: 'c'
		});
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
