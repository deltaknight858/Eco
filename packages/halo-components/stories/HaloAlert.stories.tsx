import type { Meta, StoryObj } from '@storybook/react'
import { HaloAlert } from '../index'

const meta = {
  title: 'Components/HaloAlert',
  component: HaloAlert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
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