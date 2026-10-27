import { component } from '@pionjs/pion';
import { nothing } from 'lit-html';
import { guard } from 'lit-html/directives/guard.js';
import { until } from 'lit-html/directives/until.js';

import { useRouteEvents } from './use-route-events';
import { Route, useRouter } from './use-router';

interface Props {
	routes: Route[];
}
interface RouterT extends HTMLElement, Props {}

const Router = (host: RouterT) => {
	const routes: Route[] = host.routes,
		{ route, result } = useRouter(routes);

	useRouteEvents(host, route, result);

	// Keep the current view on screen until the next one has loaded.
	return guard([result], () =>
		result ? until(Promise.resolve(result).catch(() => nothing)) : nothing,
	);
};

customElements.define('cosmoz-router', component<Props>(Router));

export default Router;
