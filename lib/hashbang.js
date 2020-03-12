const HASHBANG = '#!';
export const hashbang = {
	from() {
		const {
				location: {
					hash, origin
				}
			} = window,
			prefixLength = hash.startsWith(HASHBANG) ? 2 : 0;
		return new URL(hash.substring(prefixLength), origin).toString();
	},
	to(pathname) {
		const url = new URL(window.location);
		url.hash = `${HASHBANG}${pathname}`;
		return url.toString();
	}
};
