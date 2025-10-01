import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import path from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)', '../stories/**/*.mdx'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation',
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  viteFinal: (config) => {
    return mergeConfig(config, {
      css: {
        postcss: {
          plugins: [
            tailwindcss,
            autoprefixer,
          ],
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../')
        }
      },
      define: {
        global: 'globalThis'
      }
    })
  },
}

export default config