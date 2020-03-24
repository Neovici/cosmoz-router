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
import { useRouteEvents } from './lib/use-route-events';

const Router = function ({
	routes
}) {
	const route = useRoutes(routes),
		result = useMemo(() => route ? route.handle() : undefined, [route]),
		renderResult = useMemo(() => Promise.resolve(result).catch(() => nothing), [result]);

	useRouteEvents(route, result, this);

	return html`${until(renderResult, nothing)}`;
};

customElements.define('cosmoz-page-router', component(Router));
