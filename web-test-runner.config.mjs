import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
	nodeResolve: true,
	browsers: [
		playwrightLauncher({ product: 'chromium' }),
		playwrightLauncher({ product: 'firefox' })
	],
	coverageConfig: {
		reportDir: 'coverage',
		threshold: {
			statements: 70,
			branches: 70,
			functions: 50,
			lines: 70
		}
	},
	files: [
		'**!(node_modules)/*.test.js'
	],
	testFramework: { config: { ui: 'tdd' }},
};
