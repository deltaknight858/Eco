import type { Meta, StoryObj } from '@storybook/react'
import { HaloCard } from '../index'

const meta = {
  title: 'Components/HaloCard',
  component: HaloCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HaloCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: 'p-6 max-w-md',
    children: (
      <>
        <h3 style={{ margin: '0 0 1rem 0', color: '#00ffff' }}>Halo Card</h3>
        <p style={{ margin: 0, color: '#e2e8f0' }}>
          This card demonstrates the beautiful glassmorphism effect with subtle shadows and backdrop blur.
        </p>
      </>
    ),
  },
}

export const Compact: Story = {
  args: {
    className: 'p-4 max-w-xs',
    children: (
      <>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#00ffff' }}>Quick Stats</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: '0.875rem' }}>
          <span>Components:</span>
          <span style={{ color: '#00ffff' }}>4</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: '0.875rem' }}>
          <span>Variants:</span>
          <span style={{ color: '#00ffff' }}>12+</span>
        </div>
      </>
    ),
  },
}