import { html as htm } from '@pionjs/pion';
import { Match, BaseRoute } from './match';

const html: typeof htm = (arr, ...thru) =>
	htm(
		Object.assign(arr, { raw: true }) as unknown as TemplateStringsArray,
		...thru,
	);
export const tagFromPath = ({ pathname }: URL) =>
	pathname.substring(1).replace(/\//gu, '-');

export const createElement = (tag: string, props = {}) => {
	if (!customElements.get(tag)) {
		throw new Error(`Element ${tag} is not defined`);
	}

	// NOTE: previously this code used document.createElement, but it breaks some
	// expectations that lit-haunted makes: the fresh element is not attached to the DOM,
	// causing the useContext registration mechanism to fail

	// using a lit TemplateResult makes sure the element is connected when created
	// lit-html does not have support for dynamic tags, but we can create a TemplateResult
	// by calling the template tag function with the appropriate parameters
	// `html(strings[], ...values)`
	if (Object.keys(props).length > 0) {
		const strings = Object.keys(props).map((prop) => ` .${prop}=`);
		return html(
			[
				`<${tag}${strings[0]}`,
				...strings.slice(1),
				`></${tag}>`,
			] as unknown as TemplateStringsArray,
			...Object.values(props),
		);
	}

	return html([`<${tag}>`] as unknown as TemplateStringsArray);
};

export const load =
	<T>(
		pack: (params: Record<string, string | number>) => T,
		tag: string | ((u: URL) => string) = tagFromPath,
	) =>
	<P extends { match: Match; route: BaseRoute }>({ match, route }: P) => {
		const url = match.url;
		const params = {
			...match.result?.groups,
			...Object.fromEntries(url.searchParams ?? []),
		};
		return Promise.resolve(pack(params)).then(() =>
			createElement(typeof tag === 'function' ? tag(url) : tag, {
				params,
				route,
			}),
		);
	};
