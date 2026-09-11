import { useEffect, useMemo, useState } from '@pionjs/pion';
import { BaseRoute, match } from './match';

type PopStatePredicate = (event: PopStateEvent) => boolean;

let ignoredPopState: PopStatePredicate | undefined;
const ignoredEvents = new WeakSet<PopStateEvent>();

window.addEventListener(
	'popstate',
	(event) => {
		if (!ignoredPopState?.(event)) return;
		ignoredEvents.add(event);
		ignoredPopState = undefined;
	},
	true,
);

export const ignoreNextPopState = (
	predicate: PopStatePredicate = () => true,
) => {
	ignoredPopState = predicate;
	return () => {
		if (ignoredPopState === predicate) ignoredPopState = undefined;
	};
};

export const documentUrl = () =>
	window.location.href.replace(window.location.origin, '');

export const useUrl = () => {
	const [url, setUrl] = useState(documentUrl);
	useEffect(() => {
		const onPopState = (event: PopStateEvent) => {
			if (ignoredEvents.has(event)) return;
			setUrl(documentUrl);
		};
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, [setUrl]);

	return url;
};

export const useRoutes = <T extends BaseRoute>(routes: T[]) => {
	const url = useUrl();
	return useMemo(() => match(routes, url), [routes, url]);
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
