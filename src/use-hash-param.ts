import { useState, useEffect, useMemo, useRef } from 'haunted';

const hashUrl = () =>
		new URL(
			location.hash.replace(/^#!?/iu, '').replace('%23', '#'),
			location.origin
		),
	parameterize = (hashParam?: string) =>
		hashParam
			? () =>
					new URLSearchParams(hashUrl().hash.replace('#', '')).get(hashParam)
			: undefined;

export const link = (hashParam: string, value?: string | null) => {
		if (!hashParam) {
			return;
		}
		const url = hashUrl(),
			sp = new URLSearchParams(url.hash.replace('#', ''));

		if (value == null) {
			sp.delete(hashParam);
		} else {
			sp.set(hashParam, value);
		}

		return (
			'#!' + Object.assign(url, { hash: sp }).href.replace(location.origin, '')
		);
	},
	useHashParam = (hashParam?: string) => {
		const parameterized = useMemo(() => parameterize(hashParam), [hashParam]),
			[param, setParam] = useState(parameterized),
			ref = useRef(param);

		// eslint-disable-next-line no-void
		useEffect(() => void (ref.current = param), [param]);

		useEffect(() => {
			if (parameterized == null) {
				return;
			}
			const readParam = () => {
				const newParam = parameterized();
				if (ref.current === newParam) {
					return;
				}
				setParam(newParam);
			};
			readParam();
			window.addEventListener('popstate', readParam);
			window.addEventListener('hashchange', readParam);
			return () => {
				window.removeEventListener('popstate', readParam);
				window.removeEventListener('hashchange', readParam);
			};
		}, [parameterized]);

		const set = useMemo(
			() =>
				hashParam
					? (v: string | null) => {
							setParam(v);
							history.pushState({}, '', link(hashParam, v));
					  }
					: setParam,
			[hashParam]
		);

		return [param, set];
	};
