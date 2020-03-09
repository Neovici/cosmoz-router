import {
	nothing, html
} from 'lit-html';
import { until } from 'lit-html/directives/until';
import {
	component, useMemo
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
			result = useMemo(() => {
				if (!route) {
					dispatch(this, 'route-not-found');
					return Promise.resolve(nothing);
				}
				dispatch(this, 'route-loading', { detail: route });
				return route.handle().then(res => {
					dispatch(this, 'route-loaded', { detail: route });
					return res;
				}).
					catch(error => {
						dispatch(this, 'route-error', {
							detail: {
								route,
								error
							}
						});
						return nothing;
					});
			}, [route]);
		return html`${until(result, nothing)}`;
	};

customElements.define('cosmoz-page-router', component(Router));
