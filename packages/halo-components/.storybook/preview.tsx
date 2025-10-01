import type { Preview } from '@storybook/react'
import type { StoryFn } from '@storybook/react'
import React from 'react'
import './preview.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'eco-dark',
      values: [
        {
          name: 'eco-dark',
          value: 'radial-gradient(circle at top left, #1a1a2e, #0f0f1a)',
        },
        {
          name: 'eco-light',
          value: '#f9fafb',
        },
        {
          name: 'eco-particles',
          value: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        },
      ],
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      theme: {
        base: 'dark',
        brandTitle: '🌌 Halo-UI',
        brandUrl: 'https://github.com/deltaknight858/eco',
        colorPrimary: '#00ffff',
        colorSecondary: '#ff6b6b',
      },
    },
  },
  decorators: [
    (Story: StoryFn) => (
      <div className="eco-story-wrapper">
        <Story />
      </div>
    ),
  ],
}

export default preview