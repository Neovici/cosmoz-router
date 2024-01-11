import { useMemo } from '@pionjs/pion';

import { useRoutes } from './use-routes';
import type { BaseRoute } from './match';

export type MatchedRoute = NonNullable<ReturnType<typeof useRoutes>>;

export interface Route<T = unknown> extends BaseRoute {
	handle: (r: MatchedRoute) => T;
}

export const useRouter = <R = unknown, T extends Route<R> = Route<R>>(
	routes: T[],
) => {
	const route = useRoutes(routes);

	return {
		route,
		result: useMemo(() => {
			if (route) {
				const { handle, ..._route } = route;
				return handle(_route);
			}
		}, [route]),
	};
};
