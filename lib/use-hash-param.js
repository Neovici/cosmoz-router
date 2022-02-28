import { useState, useEffect, useMemo } from 'haunted';

const hashUrl = () =>
		new URL(
			location.hash.replace(/^#!?/iu, '').replace('%23', '#'),
			location.origin
		),
	parameterize = (hashParam) =>
		hashParam
			? () =>
					new URLSearchParams(hashUrl().hash.replace('#', '')).get(hashParam)
			: undefined;

export const link = (hashParam, value) => {
		if (!hashParam) {
			return;
		}
		const url = hashUrl(),
			sp = new URLSearchParams(url.hash.replace('#', ''));
		sp.set(hashParam, value);
		return (
			'#!' + Object.assign(url, { hash: sp }).href.replace(location.origin, '')
		);
	},
	useHashParam = (hashParam) => {
		const parameterized = useMemo(() => parameterize(hashParam), [hashParam]),
			[param, setParam] = useState(parameterized);

		useEffect(() => {
			if (parameterized == null) {
				return;
			}
			const readParam = () =>
				requestAnimationFrame(() => setParam(parameterized));
			readParam();
			window.addEventListener('popstate', readParam);
			window.addEventListener('hash-changed', readParam);
			return () => {
				window.removeEventListener('popstate', readParam);
				window.removeEventListener('hash-changed', readParam);
			};
		}, [parameterized]);

		return param;
	};
