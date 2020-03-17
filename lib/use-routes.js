import {
	useState, useEffect, useMemo
} from 'haunted';

export const fromSearch = search => Object.fromEntries(new URLSearchParams(search));
export const createElement = (tag, props = {}) => {
	if (!customElements.get(tag)) {
		throw new Error(`Element ${tag} is not defined`);
	}
	return Object.assign(document.createElement(tag), props);
};

export const match = (routes, url) => {
	for (const route of routes) {
		const match = url.pathname.match(route.rule);
		if (match) {
			return {
				...route,
				url,
				match
			};
		}
	}
};

export const useUrl = mapUrl => {
	const [url, setUrl] = useState(mapUrl.from);
	useEffect(() => {
		const onPopState = () => setUrl(mapUrl.from());
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, [mapUrl, setUrl]);
	return useMemo(() => new URL(url), [url]);
};


export const useRoutes = (routes, mapUrl) => {
	const url = useUrl(mapUrl);
	return useMemo(() => {
		const matched = match(routes, url);
		if (!matched) {
			return;
		}
		const {
			handle, ...route
		} = matched;
		return {
			...route,
			handle: (...args) => handle(route, mapUrl, ...args)
		};
	}, [routes, url]);
};

export const navigate = (url, state = null, {
	notify = true, replace = true
} = {}) => {
	(replace ? history.replaceState : history.pushState).call(history, state, '', url);
	if (notify) {
		queueMicrotask(() =>
			window.dispatchEvent(new CustomEvent('popstate', {
				bubbles: false
			})));
	}
};

