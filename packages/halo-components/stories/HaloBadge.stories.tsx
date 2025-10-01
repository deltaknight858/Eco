import type { Meta, StoryObj } from '@storybook/react'
import { HaloBadge } from '../index'

const meta = {
  title: 'Components/HaloBadge',
  component: HaloBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline']
    },
    tier: {
      control: { type: 'select' },
      options: [undefined, 'bronze', 'silver', 'gold']
    }
  }
} satisfies Meta<typeof HaloBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

// Provenance Tier Stories
export const ProvenanceBronze: Story = {
  args: {
    tier: 'bronze',
    children: 'Bronze Contributor',
  },
}

export const ProvenanceSilver: Story = {
  args: {
    tier: 'silver',
    children: 'Silver Contributor',
  },
}

export const ProvenanceGold: Story = {
  args: {
    tier: 'gold',
    children: 'Gold Contributor',
  },
}

export const ProvenanceTiers = {
  render: () => (
    <div className="flex gap-4 items-center">
      <HaloBadge tier="bronze">Bronze</HaloBadge>
      <HaloBadge tier="silver">Silver</HaloBadge>
      <HaloBadge tier="gold">Provenance Gold</HaloBadge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Provenance tiers automatically apply appropriate styling and effects.'
      }
    }
  }
}