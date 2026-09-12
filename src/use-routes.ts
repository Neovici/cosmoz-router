import { useEffect, useMemo, useState } from '@pionjs/pion';
import { BaseRoute, match } from './match';

let ignoreNextPopState = false;
const ignoredEvents = new WeakSet<PopStateEvent>();

window.addEventListener(
	'popstate',
	(event) => {
		if (!ignoreNextPopState) return;
		ignoreNextPopState = false;
		ignoredEvents.add(event);
	},
	true,
);

export const documentUrl = () =>
	window.location.href.replace(window.location.origin, '');

export const useUrl = () => {
	const [url, setUrl] = useState(documentUrl);
	useEffect(() => {
		const onPopState = () => setUrl(documentUrl);
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, [setUrl]);

	return url;
};

export const useRoutedUrl = () => {
	const [routedUrl, setRoutedUrl] = useState(documentUrl);
	useEffect(() => {
		const onPopState = (event: PopStateEvent) =>
			setRoutedUrl((current) =>
				ignoredEvents.has(event) ? current : documentUrl(),
			);
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, [setRoutedUrl]);

	return routedUrl;
};

export const useRoutes = <T extends BaseRoute>(routes: T[]) => {
	const routedUrl = useRoutedUrl();
	return useMemo(() => match(routes, routedUrl), [routes, routedUrl]);
};

export const navigate = (
	url: string,
	state: unknown = null,
	{ notify = true, replace = true } = {},
) => {
	(replace ? history.replaceState : history.pushState).call(
		history,
		state,
		'',
		url,
	);
	if (notify) {
		queueMicrotask(() =>
			window.dispatchEvent(
				new CustomEvent('popstate', {
					bubbles: false,
				}),
			),
		);
	}
};

export const go = (delta: number, { notify = true } = {}) => {
	ignoreNextPopState = !notify;
	history.go(delta);
};
