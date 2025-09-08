/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
	stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	framework: {
		name: '@storybook/web-components-vite',
		options: {},
	},
	docs: {
		autodocs: 'tag',
	},
};

export default config;
