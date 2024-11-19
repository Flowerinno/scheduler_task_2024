/** @type {import('@remix-run/dev').AppConfig} */

import { RemixConfig } from "@remix-run/dev/dist/config";

export default {
	tailwind: true,
	postcss: true,
	future: {
		v3_singleFetch: true,
	},
} as RemixConfig;
