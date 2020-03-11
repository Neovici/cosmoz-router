/* eslint-env node */
module.exports = {
	appIndex: 'demo/index.html',
	open: true,
	preserveSymlinks: true,
	dedupe: true,
	nodeResolve: { mainFields: ['browser', 'jsnext', 'jsnext:main', 'module', 'main']}
};
