import { useEffect } from 'haunted';
import type { BaseRoute } from './match';

const dispatch = (el: HTMLElement, type: string, opts?: object) =>
	el.dispatchEvent(
		new CustomEvent(type, {
			bubbles: false,
			cancelable: false,
			composed: true,
			...opts,
		})
	);

export const useRouteEvents = <T extends BaseRoute, P>(
	el: HTMLElement,
	route?: T,
	result?:  P
) => {
	useEffect(() => {
		if (!result) {
			dispatch(el, 'route-not-found');
			return;
		}
		dispatch(el, 'route-loading', { detail: route });
		Promise.resolve(result)
			.then(() => dispatch(el, 'route-loaded', { detail: route }))
			.catch((error) =>
				dispatch(el, 'route-error', {
					detail: {
						route,
						error,
					},
				})
			);
	}, [result]);
};
