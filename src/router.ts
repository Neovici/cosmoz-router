import { nothing } from 'lit-html';
import { guard } from 'lit-html/directives/guard.js';
import { until } from 'lit-html/directives/until.js';
import { component } from 'haunted';

import { useRouter, Route } from './use-router';
import { useRouteEvents } from './use-route-events';

interface Props {
	routes: Route[];
}
interface RouterT extends HTMLElement, Props {}

const Router = (host: RouterT) => {
	const routes: Route[] = host.routes,
		{ route, result } = useRouter(routes);

	useRouteEvents(host, route, result);

	return guard([result], () =>
		until(
			Promise.resolve(result).catch(() => nothing),
			nothing
		)
	);
};

customElements.define('cosmoz-router', component<Props>(Router));

export default Router;
