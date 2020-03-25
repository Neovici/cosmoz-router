export const hashbang = rule => url => {
	const origin = document.location.origin,
		/* Chrome on iOS bug encodes second `#` in url as `%23`
		 * https://github.com/Neovici/cosmoz-frontend/issues/1524
		 * https://github.com/angular/angular.js/issues/7699
		*/
		hash = new URL(url, origin).hash.replace(/^#!?/iu, '').replace('%23', '#'),
		hashUrl = new URL(hash, origin),
		result = hashUrl.pathname.match(rule);
	return result && {
		result,
		url: hashUrl
	};
};

export const href = rule => url => {
	const result = url.match(rule);
	return result && { result };
};

export const match = (routes, url) => {
	for (const route of routes) {
		const match = route.rule instanceof RegExp
			? href(route.rule)(url)
			: route.rule(url);
		if (match) {
			return {
				...route,
				match,
				url
			};
		}
	}
};
