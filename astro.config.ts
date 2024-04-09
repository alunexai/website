import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';
import {defineConfig} from 'astro/config';

export default defineConfig({
  integrations: [tailwind({nesting: true, configFile: './tailwind.config.ts'})],
  output: 'static',
  adapter: node({mode: 'standalone'}),
  site: 'https://alunex.ai/'
});
