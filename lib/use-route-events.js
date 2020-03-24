import { useEffect } from 'haunted';

const dispatch = (el, type, opts) => el.dispatchEvent(new CustomEvent(type, {
	bubbles: false,
	cancelable: false,
	composed: true,
	...opts
}));

export const useRouteEvents = (route, result, el) => {
	useEffect(() => {
		if (!result) {
			dispatch(el, 'route-not-found');
			return;
		}
		dispatch(el, 'route-loading', { detail: route });
		result
			.then(() => dispatch(el, 'route-loaded', { detail: route }))
			.catch(error =>
				dispatch(el, 'route-error', {
					detail: {
						route,
						error
					}
				})
			);

	}, [result]);
};
