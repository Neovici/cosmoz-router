/* eslint-disable import/group-exports */
export type SRule = string | RegExp;
export interface RuleRet {
	result: ReturnType<typeof String.prototype.match>;
	url?: URL;
}
export type FnRule = (url: string) => RuleRet | null;
export type Rule = SRule | FnRule;

export interface BaseRoute {
	rule: Rule;
}

export const hashbang = (rule: SRule) => (url: string) => {
		const origin = document.location.origin,
			/* Chrome on iOS bug encodes second `#` in url as `%23`
			 * https://github.com/Neovici/cosmoz-frontend/issues/1524
			 * https://github.com/angular/angular.js/issues/7699
			 */
			hash = new URL(url, origin).hash
				.replace(/^#!?/iu, '')
				.replace('%23', '#'),
			hashUrl = new URL(hash, origin),
			result = hashUrl.pathname.match(rule);
		return (
			result && {
				result,
				url: hashUrl,
			}
		);
	},
	href = (rule: SRule) => (url: string): RuleRet|null => {
		const result = url.match(rule);
		return result && { result };
	},
	match = <T extends BaseRoute>(routes: T[], url: string) => {
		for (const route of routes) {
			const rule = route.rule,
				match = typeof rule === 'function' ? rule(url) : href(rule)(url);
			if (match) {
				return {
					...route,
					route,
					match,
					url,
				};
			}
		}
	};
