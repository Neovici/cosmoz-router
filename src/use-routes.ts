import { useEffect, useMemo, useRef, useState } from '@pionjs/pion';
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

const useUrlChange = () => {
	const [change, setChange] = useState(() => ({
		url: documentUrl(),
		notify: true,
	}));
	useEffect(() => {
		const onPopState = (event: PopStateEvent) => {
			setChange({
				url: documentUrl(),
				notify: !ignoredEvents.has(event),
			});
		};
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, [setChange]);

	return change;
};

export const useUrl = () => useUrlChange().url;

export const useRoutes = <T extends BaseRoute>(routes: T[]) => {
	const change = useUrlChange();
	const routedUrl = useRef<string>(change.url);
	if (change.notify) routedUrl.current = change.url;
	const url = routedUrl.current ?? change.url;
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

export const go = (delta: number, { notify = true } = {}) => {
	ignoreNextPopState = !notify;
	history.go(delta);
};
