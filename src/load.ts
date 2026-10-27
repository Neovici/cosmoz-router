import { html } from '@pionjs/pion';
import { BaseRoute, RuleRet } from './match';

export const tagFromPath = ({ pathname }: URL) =>
	pathname.substring(1).replace(/\//gu, '-');

// lit-html does not have support for dynamic tags, but we can create a TemplateResult
// by calling the template tag function with the appropriate parameters
// `html(strings[], ...values)`
const template = (tag: string, props: string[]) => {
	const strings = props.map((prop) => ` .${prop}=`);
	return Object.assign(
		strings.length > 0
			? [`<${tag}${strings[0]}`, ...strings.slice(1), '>']
			: [`<${tag}>`],
		{ raw: true },
	) as unknown as TemplateStringsArray;
};

// lit-html identifies a template by its strings array, so reusing the array
// updates the rendered element instead of replacing it.
const templates = new Map<string, TemplateStringsArray>();
const reusedTemplate = (tag: string, props: string[]) => {
	const key = [tag, ...props].join(' ');
	if (!templates.has(key)) templates.set(key, template(tag, props));
	return templates.get(key)!;
};

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
	const names = Object.keys(props);
	return html(
		reuse ? reusedTemplate(tag, names) : template(tag, names),
		...Object.values(props),
	);
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
