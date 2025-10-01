import type { Meta, StoryObj } from '@storybook/react'
import { HaloTimeline } from '../index'

const meta = {
  title: 'Components/HaloTimeline',
  component: HaloTimeline,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    provenanceSteps: {
      control: { type: 'boolean' }
    },
    currentStep: {
      control: { type: 'select' },
      options: ['Created', 'Reviewed', 'Verified'],
      if: { arg: 'provenanceSteps', eq: true }
    }
  }
} satisfies Meta<typeof HaloTimeline>

export default meta
type Story = StoryObj<typeof meta>

export const ProvenanceCreated: Story = {
  args: {
    provenanceSteps: true,
    currentStep: 'Created',
  },
}

export const ProvenanceReviewed: Story = {
  args: {
    provenanceSteps: true,
    currentStep: 'Reviewed',
  },
}

export const ProvenanceVerified: Story = {
  args: {
    provenanceSteps: true,
    currentStep: 'Verified',
  },
}

export const CustomSteps: Story = {
  args: {
    steps: [
      { title: 'Planning', description: 'Project requirements defined', completed: true },
      { title: 'Development', description: 'Code implementation in progress', completed: true },
      { title: 'Testing', description: 'Quality assurance and testing', completed: false },
      { title: 'Deployment', description: 'Production release', completed: false }
    ]
  },
}

export const ProvenanceWorkflow = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
      <div>
        <h3 className="text-lg font-bold text-cyan-400 mb-4">Created</h3>
        <HaloTimeline provenanceSteps currentStep="Created" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-cyan-400 mb-4">Under Review</h3>
        <HaloTimeline provenanceSteps currentStep="Reviewed" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-cyan-400 mb-4">Verified</h3>
        <HaloTimeline provenanceSteps currentStep="Verified" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete provenance workflow showing all stages of contribution verification.'
      }
    }
  }
}