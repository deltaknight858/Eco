/**
 * SuggestionPanel.tsx
 * Real-time AI suggestions panel for development assistance
 */

import React, { useState, useEffect, useRef } from 'react'
import { cn, HaloCard, HaloBadge, HaloButton } from '@eco/halo-components'
import type { 
  BaseSuggestion, 
  CodeSuggestion, 
  PerformanceSuggestion,
  SecuritySuggestion,
  SuggestionContext
} from '../../../../../packages/conductor/src/ai/SuggestionEngine'

// Extended interfaces for UI components
interface AISuggestion extends BaseSuggestion {
  code?: string
  insertPosition?: { line: number; character: number }
  priority: 'low' | 'medium' | 'high'
}

interface CodeCompletion {
  id: string
  title: string
  description: string
  code: string
  confidence: number
  insertPosition: { line: number; character: number }
  replaceRange?: { start: { line: number; character: number }; end: { line: number; character: number } }
}

// Extended SuggestionContext with code property
interface ExtendedSuggestionContext extends SuggestionContext {
  code?: string
  userAction?: string
  actionParams?: any
}
import { useConductor } from '../hooks/useConductor'

// Component Interfaces
interface SuggestionPanelProps {
  context?: ExtendedSuggestionContext
  visible?: boolean
  onToggleVisibility?: () => void
  onApplySuggestion?: (suggestion: AISuggestion) => void
  className?: string
}

interface SuggestionItemProps {
  suggestion: AISuggestion
  onApply: () => void
  onDismiss: () => void
}

interface CodeCompletionProps {
  completions: CodeCompletion[]
  onApply: (completion: CodeCompletion) => void
}

interface QuickActionsProps {
  context?: ExtendedSuggestionContext
  onAction: (action: string, params?: any) => void
}

// Main SuggestionPanel Component
export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
  context,
  visible = true,
  onToggleVisibility,
  onApplySuggestion,
  className
}) => {
  const { conductor } = useConductor()
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [completions, setCompletions] = useState<CodeCompletion[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'suggestions' | 'completions' | 'performance' | 'security'>('suggestions')
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set())
  const contextRef = useRef<SuggestionContext | undefined>(context)

  // Update suggestions when context changes
  useEffect(() => {
    if (context && JSON.stringify(context) !== JSON.stringify(contextRef.current)) {
      contextRef.current = context
      fetchSuggestions(context)
    }
  }, [context, conductor])

  // Fetch AI suggestions
  const fetchSuggestions = async (suggestionContext: ExtendedSuggestionContext) => {
    if (!conductor) return

    setLoading(true)
    try {
      // Use CapsuleAgent to get suggestions
      const response = await conductor.sendMessage(
        `get suggestions for context: ${JSON.stringify(suggestionContext)}`
      )
      
      // Generate mock suggestions based on context
      const newSuggestions = generateMockSuggestions(suggestionContext)
      setSuggestions(newSuggestions)
      
      // Generate code completions if there's code context
      if (suggestionContext.code) {
        const newCompletions = generateMockCompletions(suggestionContext)
        setCompletions(newCompletions)
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Apply suggestion
  const handleApplySuggestion = (suggestion: AISuggestion) => {
    onApplySuggestion?.(suggestion)
    setDismissedSuggestions(prev => new Set(Array.from(prev).concat(suggestion.id)))
  }

  // Dismiss suggestion
  const handleDismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set(Array.from(prev).concat(suggestionId)))
  }

  // Filter out dismissed suggestions
  const activeSuggestions = suggestions.filter(s => !dismissedSuggestions.has(s.id))

  if (!visible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-slate-800 border border-slate-600/50 rounded-l-lg p-3 text-slate-300 hover:bg-slate-700 transition-colors z-50"
        aria-label="Show suggestions panel"
      >
        💡
      </button>
    )
  }

  return (
    <div className={cn("w-80 border-l border-slate-600/30 bg-slate-800/50 flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-600/30 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center">
          💡 AI Assistant
        </h2>
        <button
          onClick={onToggleVisibility}
          className="text-slate-400 hover:text-slate-300 p-1"
          aria-label="Hide suggestions panel"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-600/30">
        <nav className="flex">
          {[
            { id: 'suggestions', label: '💡', title: 'Suggestions' },
            { id: 'completions', label: '⚡', title: 'Completions' },
            { id: 'performance', label: '📈', title: 'Performance' },
            { id: 'security', label: '🔒', title: 'Security' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 py-2 px-1 text-sm font-medium transition-colors relative",
                activeTab === tab.id
                  ? "text-cyan-400 bg-slate-700/50"
                  : "text-slate-400 hover:text-slate-300"
              )}
              title={tab.title}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-slate-600/30">
        <QuickActions
          context={context}
          onAction={(action, params) => {
            // Handle quick actions
            if (context) {
              fetchSuggestions({ ...context, userAction: action, actionParams: params } as ExtendedSuggestionContext)
            }
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-sm text-slate-400">Analyzing...</div>
          </div>
        )}

        {!loading && (
          <>
            {activeTab === 'suggestions' && (
              <SuggestionsList
                suggestions={activeSuggestions.filter(s => s.type === 'general')}
                onApply={handleApplySuggestion}
                onDismiss={handleDismissSuggestion}
              />
            )}

            {activeTab === 'completions' && (
              <CodeCompletionList
                completions={completions}
                onApply={(completion) => {
                  onApplySuggestion?.({
                    id: completion.id,
                    type: 'code-completion',
                    title: 'Code Completion',
                    description: completion.description,
                    confidence: completion.confidence,
                    category: 'completion',
                    priority: 'medium',
                    impact: 'medium',
                    effort: 'low',
                    timestamp: new Date().toISOString(),
                    code: completion.code,
                    insertPosition: completion.insertPosition
                  })
                }}
              />
            )}

            {activeTab === 'performance' && (
              <SuggestionsList
                suggestions={activeSuggestions.filter(s => s.type === 'performance')}
                onApply={handleApplySuggestion}
                onDismiss={handleDismissSuggestion}
              />
            )}

            {activeTab === 'security' && (
              <SuggestionsList
                suggestions={activeSuggestions.filter(s => s.type === 'security')}
                onApply={handleApplySuggestion}
                onDismiss={handleDismissSuggestion}
              />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-600/30">
        <div className="text-xs text-slate-400 text-center">
          Powered by AI • {activeSuggestions.length} suggestions
        </div>
      </div>
    </div>
  )
}

// Suggestions List Component
interface SuggestionsListProps {
  suggestions: AISuggestion[]
  onApply: (suggestion: AISuggestion) => void
  onDismiss: (suggestionId: string) => void
}

const SuggestionsList: React.FC<SuggestionsListProps> = ({
  suggestions,
  onApply,
  onDismiss
}) => {
  if (suggestions.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-2xl mb-2">✨</div>
        <div className="text-sm text-slate-400">
          No suggestions available
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      {suggestions.map(suggestion => (
        <SuggestionItem
          key={suggestion.id}
          suggestion={suggestion}
          onApply={() => onApply(suggestion)}
          onDismiss={() => onDismiss(suggestion.id)}
        />
      ))}
    </div>
  )
}

// Individual Suggestion Item
const SuggestionItem: React.FC<SuggestionItemProps> = ({
  suggestion,
  onApply,
  onDismiss
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-400/30'
      case 'medium': return 'text-yellow-400 border-yellow-400/30'
      case 'low': return 'text-green-400 border-green-400/30'
      default: return 'text-slate-400 border-slate-400/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return '📈'
      case 'security': return '🔒'
      case 'accessibility': return '♿'
      case 'code-quality': return '✨'
      case 'best-practice': return '👍'
      default: return '💡'
    }
  }

  return (
    <HaloCard className={cn("border", getPriorityColor(suggestion.priority))}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
            <div>
              <h4 className="text-sm font-medium text-slate-200">
                {suggestion.title}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <HaloBadge 
                  variant={suggestion.priority === 'high' ? 'secondary' : 'outline'}
                >
                  {suggestion.priority}
                </HaloBadge>
                <span className="text-xs text-slate-400">
                  {Math.round(suggestion.confidence * 100)}% confidence
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-300 p-1"
            aria-label="Dismiss suggestion"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 mb-3">
          {suggestion.description}
        </p>

        {/* Code Preview */}
        {suggestion.code && (
          <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
            <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
              {suggestion.code.slice(0, 200)}
              {suggestion.code.length > 200 && '...'}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <HaloButton
            size="sm"
            variant="primary"
            onClick={onApply}
            className="flex-1"
          >
            Apply
          </HaloButton>
          <HaloButton
            size="sm"
            variant="ghost"
            onClick={onDismiss}
          >
            Dismiss
          </HaloButton>
        </div>
      </div>
    </HaloCard>
  )
}

// Code Completion List
const CodeCompletionList: React.FC<CodeCompletionProps> = ({
  completions,
  onApply
}) => {
  if (completions.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-2xl mb-2">⚡</div>
        <div className="text-sm text-slate-400">
          Start typing to see completions
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2">
      {completions.map(completion => (
        <button
          key={completion.id}
          onClick={() => onApply(completion)}
          className="w-full text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-200">
              {completion.title}
            </span>
            <span className="text-xs text-slate-400">
              {Math.round(completion.confidence * 100)}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-2">
            {completion.description}
          </p>
          <div className="bg-slate-900/50 rounded p-2">
            <code className="text-xs text-slate-300 font-mono">
              {completion.code.slice(0, 100)}
              {completion.code.length > 100 && '...'}
            </code>
          </div>
        </button>
      ))}
    </div>
  )
}

// Quick Actions Component
const QuickActions: React.FC<QuickActionsProps> = ({
  context,
  onAction
}) => {
  const actions = [
    { id: 'optimize', label: '🚀 Optimize', title: 'Optimize current code' },
    { id: 'test', label: '🧪 Test', title: 'Generate tests' },
    { id: 'document', label: '📝 Document', title: 'Add documentation' },
    { id: 'refactor', label: '♻️ Refactor', title: 'Suggest refactoring' }
  ]

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-300 mb-2">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className="p-2 text-xs bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300"
            title={action.title}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Helper functions to generate mock suggestions
function generateMockSuggestions(context: ExtendedSuggestionContext): AISuggestion[] {
  const suggestions: AISuggestion[] = []

  // Performance suggestions
  if (context.code && context.code.includes('map') && context.code.includes('filter')) {
    suggestions.push({
      id: 'perf-1',
      type: 'performance',
      title: 'Combine map and filter operations',
      description: 'You can optimize performance by combining map and filter operations into a single reduce operation.',
      confidence: 0.85,
      category: 'optimization',
      priority: 'medium',
      impact: 'medium',
      effort: 'low',
      timestamp: new Date().toISOString(),
      code: `// Instead of:\narray.filter(item => condition).map(item => transform(item))\n\n// Use:\narray.reduce((acc, item) => {\n  if (condition) acc.push(transform(item))\n  return acc\n}, [])`
    })
  }

  // Security suggestions
  if (context.code && context.code.includes('innerHTML')) {
    suggestions.push({
      id: 'sec-1',
      type: 'security',
      title: 'Avoid innerHTML for user content',
      description: 'Using innerHTML with user content can lead to XSS vulnerabilities. Use textContent or a sanitization library.',
      confidence: 0.95,
      category: 'security',
      priority: 'high',
      impact: 'high',
      effort: 'low',
      timestamp: new Date().toISOString(),
      code: `// Instead of:\nelement.innerHTML = userInput\n\n// Use:\nelement.textContent = userInput\n// Or:\nelement.innerHTML = DOMPurify.sanitize(userInput)`
    })
  }

  // Code quality suggestions
  if (context.code && context.code.includes('var ')) {
    suggestions.push({
      id: 'quality-1',
      type: 'code-quality',
      title: 'Use const/let instead of var',
      description: 'Modern JavaScript prefers const and let over var for better scoping and immutability.',
      confidence: 0.9,
      category: 'modernization',
      priority: 'low',
      impact: 'low',
      effort: 'low',
      timestamp: new Date().toISOString(),
      code: `// Instead of:\nvar name = 'value'\n\n// Use:\nconst name = 'value'\n// Or if reassignment needed:\nlet name = 'value'`
    })
  }

  // Accessibility suggestions
  if (context.code && context.code.includes('<button') && !context.code.includes('aria-label')) {
    suggestions.push({
      id: 'a11y-1',
      type: 'accessibility',
      title: 'Add aria-label to buttons',
      description: 'Buttons should have accessible labels for screen readers, especially icon buttons.',
      confidence: 0.8,
      category: 'accessibility',
      priority: 'medium',
      impact: 'medium',
      effort: 'low',
      timestamp: new Date().toISOString(),
      code: `<button aria-label="Close dialog" onClick={handleClose}>\n  ✕\n</button>`
    })
  }

  return suggestions
}

function generateMockCompletions(context: ExtendedSuggestionContext): CodeCompletion[] {
  const completions: CodeCompletion[] = []

  if (context.code && context.code.includes('useState')) {
    completions.push({
      id: 'completion-1',
      title: 'useState with TypeScript',
      description: 'Add TypeScript type annotation to useState',
      code: 'const [value, setValue] = useState<string>("")',
      confidence: 0.9,
      insertPosition: { line: 1, character: 0 },
      replaceRange: { start: { line: 1, character: 0 }, end: { line: 1, character: 20 } }
    })
  }

  if (context.code && context.code.includes('useEffect')) {
    completions.push({
      id: 'completion-2',
      title: 'useEffect with cleanup',
      description: 'Add cleanup function to useEffect',
      code: `useEffect(() => {
  // Effect logic here
  
  return () => {
    // Cleanup logic here
  }
}, [dependencies])`,
      confidence: 0.85,
      insertPosition: { line: 1, character: 0 },
      replaceRange: { start: { line: 1, character: 0 }, end: { line: 1, character: 20 } }
    })
  }

  return completions
}

export default SuggestionPanel