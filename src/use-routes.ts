import { useState, useEffect, useMemo } from '@pionjs/pion';
import { match, BaseRoute } from './match';

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

export const useRoutes = <T extends BaseRoute>(routes: T[]) => {
	const url = useUrl();
	return useMemo(() => match(routes, url), [routes, url]);
};

export const navigate = (
	url: string,
	state = null,
	{ notify = true, replace = true } = {}
) => {
	(replace ? history.replaceState : history.pushState).call(
		history,
		state,
		'',
		url
	);
	if (notify) {
		queueMicrotask(() =>
			window.dispatchEvent(
				new CustomEvent('popstate', {
					bubbles: false,
				})
			)
		);
	}
};
