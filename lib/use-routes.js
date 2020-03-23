import {
	useState, useEffect, useMemo
} from 'haunted';
import { match } from './match';

export const documentUrl = () => window.location.href.replace(window.location.origin, '');

export const createElement = (tag, props = {}) => {
	if (!customElements.get(tag)) {
		throw new Error(`Element ${tag} is not defined`);
	}
	return Object.assign(document.createElement(tag), props);
};


export const useUrl = () => {
	const [url, setUrl] = useState(documentUrl);
	useEffect(() => {
		const onPopState = () => setUrl(documentUrl);
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, [setUrl]);

	return url;
};


export const useRoutes = routes => {
	const url = useUrl(),
		matched = useMemo(() => match(routes, url), [routes, url]);
	return useMemo(() => {
		if (!matched) {
			return;
		}
		const {
			handle,
			...route
		} = matched;
		return {
			...route,
			handle: (...args) => handle(route, ...args)
		};
	}, [matched]);
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

