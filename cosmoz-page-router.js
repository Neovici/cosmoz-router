import {
	nothing, html
} from 'lit-html';
import { until } from 'lit-html/directives/until';
import {
	component, useMemo, useEffect
} from 'haunted';
import {
	useRoutes
} from './lib/use-routes';
import { hashbang } from './lib/hashbang';

const dispatch = (el, type, opts) => el.dispatchEvent(new CustomEvent(type, {
		bubbles: false,
		cancelable: false,
		composed: true,
		...opts
	})),
	Router = function ({
		routes,
		mapUrl = hashbang
	}) {
		const route = useRoutes(routes, mapUrl),
			result = useMemo(() => route ? Promise.resolve(route.handle()) : undefined, [route]);

		useEffect(() => {
			if (!result) {
				dispatch(this, 'route-not-found');
				return;
			}
			dispatch(this, 'route-loading', { detail: route });
			result
				.then(() => dispatch(this, 'route-loaded', { detail: route }))
				.catch(error =>
					dispatch(this, 'route-error', {
						detail: {
							route,
							error
						}
					})
				);

		}, [result]);
		return html`${until(Promise.resolve(result).catch(() => nothing), nothing)}`;
	};

customElements.define('cosmoz-page-router', component(Router));
