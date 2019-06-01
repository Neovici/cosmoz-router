/**
The `cosmoz-page-location` element manages binding to and from the current URL.

@demo demo/location.html
*/
/*
	FIXME(polymer-modulizer): the above comments were extracted
	from HTML and may be out of place here. Review them and
	then delete this comment!
*/
import '../@webcomponents/shadycss/entrypoints/apply-shim.js';

import { PolymerElement } from '../@polymer/polymer/polymer-element.js';
import '../@polymer/iron-location/iron-location.js';
import '../@polymer/iron-location/iron-query-params.js';
import { html } from '../@polymer/polymer/lib/utils/html-tag.js';

class CosmozPageLocation extends PolymerElement {
	static get template() {
		return html`
		<iron-location url-space-regex="^\$" id="location" path="{{ appPath }}" query="{{ _appQueryString }}" hash="{{ _appHashString }}">
		</iron-location>
		<iron-query-params id="params"></iron-query-params>
`;
	}

	constructor() {
		super();
		this._parseRegexp = /(!(?=\/))?([^#?]+)?\??([^#]+)?#?(.+)?$/i;
	}
	/**
	 * Get component name.
	 *
	 * @returns {string} Name.
	 */
	static get is() {
		return 'cosmoz-page-location';
	}
	/**
	 * Get component properties.
	 *
	 * @returns {object} Properties.
	 */
	static get properties() {
		return {
			appPath: {
				type: String,
				notify: true
			},

			_appQueryString: {
				type: String
			},

			_appHashString: {
				type: String,
				observer: '_appHashChanged'
			},

			routePath: {
				type: String,
				notify: true,
				observer: '_routeChanged'
			},

			routeQuery: {
				type: Object,
				value() {
					return {};
				},
				notify: true
			},

			routeHash: {
				type: Object,
				value() {
					return {};
				},
				notify: true
			},

			dwellTime: {
				type: Number,
				value: 2000
			},

			microDwellTime: {
				type: Number,
				value: Infinity
			},

			hashBang: {
				type: Boolean,
				readOnly: true
			}
		};
	}
	/**
	 * Convert parameters object to a string.
	 *
	 * @param {object} value Parameters.
	 * @returns {string} Name.
	 */
	_paramsToString(value) {
		if (typeof value === 'string') {
			return value;
		}
		return this.$.params._encodeParams(value)
			.replace(/%3F/g, '?').replace(/%2F/g, '/').replace(/'/g, '%27');
	}
	/**
	 * Convert parameters string to an object.
	 *
	 * @param {object} value Parameters.
	 * @returns {string} Name.
	 */
	_paramsFromString(value) {
		return this.$.params._decodeParams(value);
	}
	/**
	 * Set a quantity of properties.
	 *
	 * @param {array} props Properties.
	 * @returns {void}
	 */
	_batchMicroUpdate(props) {
		const updatedPaths = {};

		Object.keys(props).forEach(path => {
			let currentPropValue = this.get(path),
				newPropValue = props[path],
				newPropValueKeys = Object.keys(newPropValue);

			if (typeof currentPropValue !== 'object') {
				if (currentPropValue !== newPropValue) {
					updatedPaths[path] = newPropValue;
				}
				return;
			}

			// Set deleted properties to null
			Object.keys(currentPropValue).forEach(subPath => {
				if (newPropValueKeys.indexOf(subPath) < 0) {
					updatedPaths[path + '.' + subPath] = null;
				}
			});
			// Update changed properties
			Object.keys(newPropValue).forEach(subPath => {
				if (currentPropValue[subPath] === newPropValue[subPath]) {
					return;
				}
				updatedPaths[path + '.' + subPath] = newPropValue[subPath];
			});
		});

		this.setProperties(updatedPaths);
	}
	/**
	 * Parse the application hash string and return it as an object.
	 *
	 * @param {string} appHashString App hash string.
	 * @returns {object} Objectified app hash string.
	 */
	_parse(appHashString) {
		const matches = this._parseRegexp.exec(appHashString) || [];
		return {
			hashBang: !!matches[1],
			path: matches[2] || '',
			query: this._paramsFromString(matches[3]),
			hash: this._paramsFromString(matches[4])
		};
	}
	/**
	 * Encode an object route as a string.
	 *
	 * @param {object} route Route.
	 * @returns {string} Encoded route.
	 */
	_encode(route = {}) {
		const path = (route.hashBang ? '!' : '') + (route.path || ''),
			query = this._paramsToString(route.query),
			hash = this._paramsToString(route.hash),
			hashAndQuery = [
				query ? '?' + query.replace(/#/g, '%23') : '',
				hash ? '#' + hash.replace(/\?/g, '%3F') : ''
			];
		return path + hashAndQuery.join('');
	}
	/**
	 * Get route.
	 *
	 * @returns {object} Route.
	 */
	getRoute() {
		return {
			hashBang: this.hashBang,
			path: this.routePath,
			query: Object.assign({}, this.routeQuery),
			hash: Object.assign({}, this.routeHash),
		};
	}
	/**
	 * Get route URL.
	 *
	 * @param {object} route Route to base URL on.
	 * @returns {string} Route URL.
	 */
	getRouteUrl(route = this.getRoute()) {
		return '#' + this._encode(route);
	}
	/**
	 * Get application URL.
	 *
	 * @param {object} query Query.
	 * @param {object} route Route.
	 * @returns {string} URL.
	 */
	getAppUrl(query, route = this.getRoute()) {
		let appQuery = this._appQueryString;

		if (query && typeof query === 'object') {
			appQuery = Object.assign({}, this._paramsFromString(appQuery), query);
		}

		return this._encode({
			path: this.appPath,
			query: appQuery,
			hash: this._encode(route)
		});
	}
	/**
	 * Update application hash bang, properties, route path, route hash and route query.
	 *
	 * @param {string} _appHashString Application hash string.
	 * @returns {void}
	 */
	_appHashChanged(_appHashString) {
		const route = this._parse(_appHashString);
		this._setHashBang(route.hashBang);

		// Batch update of properties if using Polymer 2.x
		this._batchMicroUpdate({
			routePath: route.path,
			routeHash: route.hash,
			routeQuery: route.query
		});

		if (this._hasRouteObservers) {
			return;
		}
		this._createMethodObserver('_routeChanged(routeQuery.*)');
		this._createMethodObserver('_routeChanged(routeHash.*)');
		this._hasRouteObservers = true;
	}
	/**
	 * Prepare and set application hash string.
	 *
	 * @param {object} change Notified change.
	 * @returns {void}
	 */
	_routeChanged(change) {
		if (!this.isConnected) {
			return;
		}

		const path = change && change.path;

		let route,
			routeHashUri;

		if (path && path.startsWith('routeHash')) {
			// See issue #36
			// If this cosmoz-page-location query parameters are not in sync with the URL, and we are trying to update
			// some hash params, then we will update the URL with incorrect route hash string
			// To avoid that, use the actual location
			route = this._parse(window.decodeURIComponent(window.location.hash.slice(1)));
			routeHashUri = this._encode({ hashBang: route.hashBang, path: route.path, query: route.query, hash: this.routeHash });
		} else {
			route = this.getRoute();
			routeHashUri = this._encode(route);
		}

		if (this._appHashString === routeHashUri) {
			return;
		}

		this.$.location.dwellTime = path && path.length ? this.microDwellTime : this.dwellTime;
		this._appHashString = routeHashUri;
	}
}

customElements.define(CosmozPageLocation.is, CosmozPageLocation);
