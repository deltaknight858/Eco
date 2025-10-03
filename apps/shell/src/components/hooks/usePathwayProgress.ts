import { useEffect, useMemo, useState } from 'react'
import type { AgentEvent, PathwayDefinition, PathwayStep, PathwayStepProgress } from '../../types'

export interface PathwayProgressState {
  stepProgress: Record<string, PathwayStepProgress>
  activeSteps: string[]
  completedSteps: string[]
}

const INITIAL_STATE: PathwayProgressState = {
  stepProgress: {},
  activeSteps: [],
  completedSteps: []
}

interface UsePathwayProgressArgs {
  pathway: PathwayDefinition
  events: AgentEvent[]
  capsuleId?: string
}

export function usePathwayProgress({ pathway, events, capsuleId }: UsePathwayProgressArgs): PathwayProgressState {
  const [state, setState] = useState<PathwayProgressState>(INITIAL_STATE)

  const stepsById = useMemo(() => {
    return pathway.steps.reduce<Record<string, PathwayStep>>((acc, step) => {
      acc[step.id] = step
      return acc
    }, {})
  }, [pathway.steps])

  useEffect(() => {
    if (!events.length) {
      setState(INITIAL_STATE)
      return
    }

    const progressMap: Record<string, PathwayStepProgress> = {}
    const active = new Set<string>()
    const completed = new Set<string>()

    events.forEach(event => {
      if (capsuleId && event.capsuleId && event.capsuleId !== capsuleId) {
        return
      }

      if (event.type === 'capsule') {
        const payload = event.payload
        let stepKey = payload?.stepId ?? payload?.currentStep ?? payload?.lifecycle

        if (typeof stepKey === 'number') {
          const step = pathway.steps[stepKey]
          stepKey = step?.id
        }

        if (!stepKey || !stepsById[stepKey]) {
          return
        }

        let progressValue = payload?.progress ?? 0
        progressValue = progressValue <= 1 ? Math.round(progressValue * 100) : Math.round(progressValue)
        progressValue = Math.min(100, Math.max(0, progressValue))

        progressMap[stepKey] = {
          progress: progressValue,
          lastUpdated: event.timestamp
        }

        if (progressValue >= 100) {
          completed.add(stepKey)
        } else if (progressValue > 0) {
          active.add(stepKey)
        }
      }

      if (event.type === 'provenance') {
        const payload = event.payload
        const stepId = payload?.stepId
        if (stepId && stepsById[stepId]) {
          progressMap[stepId] = {
            progress: 100,
            lastUpdated: event.timestamp
          }
          completed.add(stepId)
          active.delete(stepId)
        }
      }
    })

    setState({
      stepProgress: progressMap,
      activeSteps: Array.from(active),
      completedSteps: Array.from(completed)
    })
  }, [events, capsuleId, stepsById, pathway])

  return state
}

export default usePathwayProgress
