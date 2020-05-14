import {
	nothing,
	html
} from 'lit-html';
import {
	component,
	useMemo
} from 'haunted';
import { useRoutes } from './lib/use-routes';
import { useRouteEvents } from './lib/use-route-events';
import { usePromise } from '@neovici/cosmoz-utils/lib/hooks/use-promise';

const Router = function ({
	routes
}) {
	const route = useRoutes(routes),
		result = useMemo(() => route ? route.handle() : undefined, [route]),
		renderResult = useMemo(() => Promise.resolve(result).catch(() => nothing), [result]),
		[output] = usePromise(renderResult);

	useRouteEvents(route, result, this);

	return html`${output || nothing}`;
};

customElements.define('cosmoz-page-router', component(Router));
