import type { Meta, StoryObj } from '@storybook/react'
import { HaloAlert } from '../index'

const meta = {
  title: 'Components/HaloAlert',
  component: HaloAlert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['info', 'success', 'warning', 'error', 'provenance']
    }
  }
} satisfies Meta<typeof HaloAlert>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'This is an informational alert with neon accents.',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Operation completed successfully!',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Please review your settings before proceeding.',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Something went wrong. Please try again.',
  },
}

export const Provenance: Story = {
  args: {
    variant: 'provenance',
    children: 'This capsule has been verified through Eco\'s provenance system.',
  },
}

export const ProvenanceExamples = {
  render: () => (
    <div className="space-y-4 max-w-lg">
      <HaloAlert variant="provenance">
        This contribution has been verified and meets all provenance standards.
      </HaloAlert>
      <HaloAlert variant="provenance">
        Your code review has been stamped with provenance verification.
      </HaloAlert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Provenance alerts automatically include verification badges and styling.'
      }
    }
  }
}