import cfg from '@neovici/cfg/web/dev-server.mjs';
import { storybookPlugin } from '@web/dev-server-storybook';

export default {
	...cfg,
	plugins: [
		...cfg.plugins,
		storybookPlugin({ type: 'web-components' }),
	],
};
