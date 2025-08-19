import cfg from '@neovici/cfg/eslint/index.mjs';

export default [
	...cfg,
	{
		ignores: ['coverage/', 'dist/', '__snapshots__', 'storybook-static/'],
	},
	{
		languageOptions: {
			globals: {
				Cosmoz: 'readonly',
			},
		},
		rules: {
			'no-console': 'off',
			'import/group-exports': 0,
			'mocha/no-global-tests': 'off',
			'mocha/max-top-level-suites': 'off',
		},
	},
];
