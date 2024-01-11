import { nothing } from 'lit-html';
import type { DirectiveResult } from 'lit-html/directive.js';
import { guard, GuardDirective } from 'lit-html/directives/guard.js';
import { until } from 'lit-html/directives/until.js';
import { component } from '@pionjs/pion';

import { useRouter, Route } from './use-router';
import { useRouteEvents } from './use-route-events';

interface Props {
	routes: Route[];
}
interface RouterT extends HTMLElement, Props {}

const Router = (host: RouterT): DirectiveResult<typeof GuardDirective> => {
	const routes: Route[] = host.routes,
		{ route, result } = useRouter(routes);

	useRouteEvents(host, route, result);

	return guard([result], () =>
		until(
			Promise.resolve(result).catch(() => nothing),
			nothing,
		),
	);
};

customElements.define('cosmoz-router', component<Props>(Router));

export default Router;
