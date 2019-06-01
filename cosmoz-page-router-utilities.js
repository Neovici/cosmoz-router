import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';

// segmentsMatch(routeSegments, routeIndex, urlSegments, urlIndex, pathVariables)
// recursively test the route segments against the url segments in place (without creating copies of the arrays
// for each recursive call)
//
// example routeSegments ['', 'user', ':userId', '**']
// example urlSegments ['', 'user', '123', 'bio']
const segmentsMatch = function (routeSegments, routeIndex, urlSegments, urlIndex, pathVariables) {
	const
		routeSegment = routeSegments[routeIndex],
		urlSegment = urlSegments[urlIndex];
	let i;

	// if we're at the last route segment and it is a globstar, it will match the rest of the url
	if (routeSegment === '**' && routeIndex === routeSegments.length - 1) {
		return true;
	}

	// we hit the end of the route segments or the url segments
	if (routeSegment === undefined || urlSegment === undefined) {
	// return true if we hit the end of both at the same time meaning everything else matched, else return false
		return routeSegment === urlSegment;
	}

	// if the current segments match, recursively test the remaining segments
	if (routeSegment === urlSegment || routeSegment === '*' || routeSegment.charAt(0) === ':') {
	// store the path variable if we have a pathVariables object
		if (routeSegment.charAt(0) === ':' && pathVariables !== undefined) {
			pathVariables[routeSegment.substring(1)] = urlSegments[urlIndex];
		}
		return segmentsMatch(routeSegments, routeIndex + 1, urlSegments, urlIndex + 1, pathVariables);
	}

	// globstars can match zero to many URL segments
	if (routeSegment === '**') {
		// test if the remaining route segments match any combination of the remaining url segments
		for (i = urlIndex; i < urlSegments.length; i += 1) {
			if (segmentsMatch(routeSegments, routeIndex + 1, urlSegments, i, pathVariables)) {
				return true;
			}
		}
	}

	// all tests failed, the route segments do not match the url segments
	return false;
};

/** @polymerBehavior */
export const PageRouterUtilities = dedupingMixin(base => class extends base {
	// @license MIT
	// @copyright Erik Ringsmuth 2015
	//
	// parseUrl(location, mode) - Augment the native URL() constructor to get info about hash paths
	//
	// Example parseUrl('http://domain.com/other/path?queryParam3=false#/example/path?queryParam1=true&queryParam2=example%20string#middle', 'auto')
	//
	// returns {
	//	 path: '/example/path',
	//	 hash: '#middle'
	//	 search: '?queryParam1=true&queryParam2=example%20string',
	//	 isHashPath: true
	// }
	//
	// Note: The location must be a fully qualified URL with a protocol like 'http(s)://'
	parseUrl(location, mode) {
		const
			url = {
				isHashPath: mode === 'hash'
			};
		let nativeUrl,
			anchor,
			searchIndex,
			secondHashIndex;

		if (typeof URL === 'function') {
			// browsers that support `new URL()`
			nativeUrl = new URL(location);
			url.path = nativeUrl.pathname;
			url.hash = nativeUrl.hash;
			url.search = nativeUrl.search;
		} else {
			// IE
			anchor = document.createElement('a');
			anchor.href = location;
			url.path = anchor.pathname;
			if (url.path.charAt(0) !== '/') {
				url.path = '/' + url.path;
			}
			url.hash = anchor.hash;
			url.search = anchor.search;
		}

		// check for a hash path
		if (url.hash.substring(0, 2) === '#/') {
			// hash path
			url.isHashPath = true;
			url.path = url.hash.substring(1);
		} else if (url.hash.substring(0, 3) === '#!/') {
		// hashbang path
			url.isHashPath = true;
			url.path = url.hash.substring(2);
		} else if (url.isHashPath) {
		// still use the hash if mode="hash"
			if (url.hash.length === 0) {
				url.path = '/';
			} else {
				url.path = url.hash.substring(1);
			}
		}

		if (url.isHashPath) {
			url.hash = '';

			// hash paths might have an additional hash in the hash path for scrolling to a specific part of the page #/hash/path#elementId
			secondHashIndex = url.path.indexOf('#');
			if (secondHashIndex !== -1) {
				url.hash = url.path.substring(secondHashIndex);
				url.path = url.path.substring(0, secondHashIndex);
			}

			// hash paths get the search from the hash if it exists
			searchIndex = url.path.indexOf('?');
			if (searchIndex !== -1) {
				url.search = url.path.substring(searchIndex);
				url.path = url.path.substring(0, searchIndex);
			}
		}
		return url;
	}

	// testRoute(routePath, urlPath) - Test if the route's path matches the URL's path
	//
	// Example routePath: '/user/:userId/**'
	// Example urlPath = '/user/123/bio'
	testRoute(routePath, urlPath) {
		// try to fail or succeed as quickly as possible for the most common cases
		let rPath = routePath;

		// if the urlPath is an exact match or '*' then the route is a match
		if (rPath === urlPath || rPath === '*') {
			return true;
		}

		// relative routes a/b/c are the same as routes that start with a globstar /**/a/b/c
		if (rPath.charAt(0) !== '/') {
			rPath = '/**/' + rPath;
		}

		// recursively test if the segments match (start at 1 because 0 is always an empty string)
		return segmentsMatch(rPath.split('/'), 1, urlPath.split('/'), 1);
	}

	// routeArguments(routePath, urlPath, search, isRegExp) - Gets the path variables and query parameter values from the URL
	routeArguments(routePath, urlPath, search, isRegExp, typecast) {
		const
			args = {};
		let arg,
			i,
			queryParameter,
			queryParameterParts,
			queryParameters,
			rPath = routePath;
		// regular expressions can't have path variables
		if (!isRegExp) {
		// relative routes a/b/c are the same as routes that start with a globstar /**/a/b/c
			if (rPath.charAt(0) !== '/') {
				rPath = '/**/' + rPath;
			}

			// get path variables
			// urlPath '/customer/123'
			// routePath '/customer/:id'
			// parses id = '123'
			segmentsMatch(rPath.split('/'), 1, urlPath.split('/'), 1, args);
		}

		queryParameters = search.substring(1).split('&');
		// split() on an empty string has a strange behavior of returning [''] instead of []
		if (queryParameters.length === 1 && queryParameters[0] === '') {
			queryParameters = [];
		}
		for (i = 0; i < queryParameters.length; i += 1) {
			queryParameter = queryParameters[i];
			queryParameterParts = queryParameter.split('=');
			args[queryParameterParts[0]] = queryParameterParts.splice(1, queryParameterParts.length - 1).join('=');
		}

		if (typecast) {
		// parse the arguments into unescaped strings, numbers, or booleans
			for (arg in args) {
				if (args.hasOwnProperty(arg)) {
					args[arg] = this._typecast(args[arg]);
				}
			}
		}

		return args;
	}

	// typecast(value) - Typecast the string value to an unescaped string, number, or boolean
	_typecast(value) {
		// bool
		if (value === 'true') {
			return true;
		}
		if (value === 'false') {
			return false;
		}

		// number
		if (!isNaN(value) && value !== '' && value.charAt(0) !== '0') {
			return +value;
		}

		// string
		return decodeURIComponent(value);
	}
});
