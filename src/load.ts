import { noChange } from 'lit-html';
import { Directive, directive, ElementPart } from 'lit-html/directive.js';
import { keyed } from 'lit-html/directives/keyed.js';
import { html, unsafeStatic } from 'lit-html/static.js';
import { BaseRoute, RuleRet } from './match';

export const tagFromPath = ({ pathname }: URL) =>
	pathname.substring(1).replace(/\//gu, '-');

class Properties extends Directive {
	render(props: object) {
		return props;
	}

	override update(part: ElementPart, [props]: [object]) {
		Object.assign(part.element, props);
		return noChange;
	}
}

const properties = directive(Properties);

export const createElement = (
	tag: string,
	props = {},
	{ reuse = false }: { reuse?: boolean } = {},
) => {
	if (!customElements.get(tag)) {
		throw new Error(`Element ${tag} is not defined`);
	}

	// NOTE: previously this code used document.createElement, but it breaks some
	// expectations that lit-haunted makes: the fresh element is not attached to the DOM,
	// causing the useContext registration mechanism to fail
	// using a lit TemplateResult makes sure the element is connected when created
	const name = unsafeStatic(tag),
		element = html`<${name} ${properties(props)}></${name}>`;

	// lit-html reuses the element of a template with the same tag, so a fresh
	// key is what replaces it.
	return reuse ? element : keyed({}, element);
};

export const load =
	<T>(
		pack: (params: Record<string, string | number>) => T,
		tag: string | ((u: URL) => string) = tagFromPath,
		options?: { reuse?: boolean },
	) =>
	<P extends { match: RuleRet; route: BaseRoute }>({ match, route }: P) => {
		const url = match.url;
		const params = {
			...match.result?.groups,
			...Object.fromEntries(url.searchParams ?? []),
		};
		return Promise.resolve(pack(params)).then(() =>
			createElement(
				typeof tag === 'function' ? tag(url) : tag,
				{
					params,
					route,
				},
				options,
			),
		);
	};
