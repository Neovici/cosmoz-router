import {
	assert, html, fixture
} from '@open-wc/testing';

import { microTask } from '@polymer/polymer/lib/utils/async';

/* eslint-disable max-lines-per-function */
suite('cosmoz-page-location', () => {
	let location;
	const tests = {
		'path/to/route': {
			hashBang: false,
			path: 'path/to/route',
			hash: {},
			query: {}
		},
		'path/to/route#hashKey=hashValue': {
			hashBang: false,
			path: 'path/to/route',
			hash: {
				hashKey: 'hashValue'
			},
			query: {}
		},
		'path/to/route?queryKey=queryValue': {
			hashBang: false,
			path: 'path/to/route',
			hash: {},
			query: {
				queryKey: 'queryValue'
			}
		},
		'path/to/route?queryKey=queryValue#hashKey=hashValue': {
			hashBang: false,
			path: 'path/to/route',
			hash: {
				hashKey: 'hashValue'
			},
			query: {
				queryKey: 'queryValue'
			}
		},
		'!path/to/route': {
			hashBang: false,
			path: '!path/to/route',
			hash: {},
			query: {}
		},
		'!/path/to/route': {
			hashBang: true,
			path: '/path/to/route',
			hash: {},
			query: {}
		}
	};

	suiteSetup(async () => {
		await import('../cosmoz-page-location.js');
	});

	setup(async () => {
		location = await fixture(html`<cosmoz-page-location />`);
		await new Promise(resolve => microTask.run(resolve));

	});

	Object.keys(tests).forEach((key, index) => {
		test('parses location #' + index, () => {
			assert.deepEqual(location._parse(key), tests[key]);
		});
	});

	Object.keys(tests).forEach((key, index) => {
		const value = tests[key];
		test('encodes location #' + index, () => {
			assert.equal(location._encode(value), key);
		});
	});

	test('getRouteUrl returns route url', () => {
		assert.equal(location.getRouteUrl(), '#');
		assert.equal(location.getRouteUrl({
			hashBang: false,
			path: 'path/to/route',
			hash: {
				hashKey: 'hashValue'
			},
			query: {}
		}), '#path/to/route#hashKey=hashValue');
	});

	test('getAppUrl returns app url with query', () => {
		const parts = location.getAppUrl({ queryKey: 'queryValue' }).split('?');
		assert.equal(parts[parts.length - 1], 'queryKey=queryValue');
	});

	test('_routeChanged updates _appHashString', () => {
		location.routeQuery = {
			queryKey: 'queryValue'
		};
		assert.equal(location._appHashString, '?queryKey=queryValue');
	});
});
