import { nothing } from 'lit-html';
import { guard } from 'lit-html/directives/guard';
import { until } from 'lit-html/directives/until';
import { component, useMemo } from 'haunted';

import { useRoutes } from './use-routes';
import { useRouteEvents } from './use-route-events';

import type { Route as RouteT } from './match';

type MatchedRoute = NonNullable<ReturnType<typeof useRoutes>>;

export interface Route<T = unknown> extends RouteT {
	handle: (r: MatchedRoute) => Promise<T>;
}
interface Props {
	routes: Route[];
}
interface RouterT extends HTMLElement, Props {}

const Router = (host: RouterT) => {
	const routes: Route[] = host.routes,
		route = useRoutes(routes),
		result = useMemo(() => {
			if (route) {
				const { handle, ..._route } = route;
				return handle(_route);
			}
		}, [route]);

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
