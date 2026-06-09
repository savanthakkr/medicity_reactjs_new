import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, __dirname, '');
	const buildTime = env.VITE_BUILD_TIME || new Date().toISOString();

	return {
		plugins: [react(), tailwindcss()],
		define: {
			'import.meta.env.VITE_BUILD_TIME': JSON.stringify(buildTime),
			'import.meta.env.VITE_BUILD_MODE': JSON.stringify(mode)
		},
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src')
			}
		},
		server: {
			port: 5173,
			strictPort: true,
			open: false
		},
		preview: {
			port: 4173,
			strictPort: true
		},
		esbuild:
			mode === 'production'
				? {
						drop: ['console']
					}
				: undefined,
		build: {
			sourcemap: false
		}
	};
});
