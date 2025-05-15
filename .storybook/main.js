import esbuild from 'rollup-plugin-esbuild';

/** @type { import('@web/storybook-framework-web-components').StorybookConfig } */
const config = {
	stories: ['../stories/**/*.stories.{js,ts,mdx}'],
	addons: ['@storybook/addon-essentials', '@storybook/addon-links'],
	framework: {
		name: '@web/storybook-framework-web-components',
	},
	/* Try to make the build parse TS files */
	async rollupFinal(config) {
		// add extra configuration for rollup
		// e.g. a new plugin
		config.plugins.push(esbuild({}));

		return config;
	},
};

export default config;
