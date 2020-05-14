import {
	useState, useEffect, useMemo, html
} from 'haunted';
import { match } from './match';

export const
	documentUrl = () => window.location.href.replace(window.location.origin, ''),

	createElement = (tag, props = {}) => {
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
			const strings = Object.keys(props).map(prop => ` .${prop}=`);
			return html(
				[`<${tag}${strings[0]}`, ...strings.slice(1), '>'],
				...Object.values(props)
			);
		}

		return html([`<${tag}>`]);
	},

	useUrl = () => {
		const [url, setUrl] = useState(documentUrl);
		useEffect(() => {
			const onPopState = () => setUrl(documentUrl);
			window.addEventListener('popstate', onPopState);
			return () => window.removeEventListener('popstate', onPopState);
		}, [setUrl]);

		return url;
	},

	useRoutes = routes => {
		const url = useUrl(),
			matched = useMemo(() => match(routes, url), [routes, url]);
		return useMemo(() => {
			if (!matched) {
				return;
			}
			const {
				handle,
				...route
			} = matched;
			return {
				...route,
				handle: (...args) => handle(route, ...args)
			};
		}, [matched]);
	},

	navigate = (url, state = null, {
		notify = true, replace = true
	} = {}) => {
		(replace ? history.replaceState : history.pushState).call(history, state, '', url);
		if (notify) {
			queueMicrotask(() =>
				window.dispatchEvent(new CustomEvent('popstate', {
					bubbles: false
				})));
		}
	};

