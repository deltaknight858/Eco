/**
 * CollaborationPanel.tsx
 * Real-time collaborative editing features for capsule development
 */

import React, { useState, useEffect, useRef } from 'react'
import { cn, HaloCard, HaloBadge, HaloButton } from '@eco/halo-components'
import { useConductor } from '../hooks/useConductor'

// Collaboration Interfaces
interface CollaborationPanelProps {
  capsuleId?: string
  visible?: boolean
  onToggleVisibility?: () => void
  className?: string
}

interface CollaborationUser {
  id: string
  name: string
  email: string
  avatar?: string
  cursor?: { line: number; column: number; file: string }
  selection?: { start: { line: number; column: number }; end: { line: number; column: number }; file: string }
  status: 'online' | 'away' | 'editing'
  lastSeen: string
  role: 'owner' | 'collaborator' | 'viewer'
}

interface CollaborationActivity {
  id: string
  type: 'file-edit' | 'file-create' | 'file-delete' | 'comment' | 'suggestion' | 'merge'
  user: CollaborationUser
  timestamp: string
  description: string
  file?: string
  details?: any
}

interface ConflictResolution {
  id: string
  file: string
  conflicts: {
    id: string
    type: 'content' | 'structure' | 'dependency'
    description: string
    userA: CollaborationUser
    userB: CollaborationUser
    changeA: string
    changeB: string
    timestamp: string
  }[]
  status: 'pending' | 'resolved' | 'ignored'
}

interface CommitHistory {
  id: string
  author: CollaborationUser
  timestamp: string
  message: string
  filesChanged: string[]
  parentCommit?: string
  branch: string
}

// Main CollaborationPanel Component
export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  capsuleId,
  visible = true,
  onToggleVisibility,
  className
}) => {
  const { conductor } = useConductor()
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([])
  const [recentActivity, setRecentActivity] = useState<CollaborationActivity[]>([])
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([])
  const [commitHistory, setCommitHistory] = useState<CommitHistory[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'conflicts' | 'history'>('users')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  // Initialize collaboration features
  useEffect(() => {
    if (capsuleId && visible) {
      initializeCollaboration()
      loadCollaborationData()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [capsuleId, visible])

  // Initialize real-time collaboration
  const initializeCollaboration = () => {
    // Mock WebSocket connection for real-time features
    // In a real implementation, this would connect to a collaboration server
    console.log('Initializing collaboration for capsule:', capsuleId)
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateCollaborationData()
    }, 5000)

    return () => clearInterval(interval)
  }

  // Load initial collaboration data
  const loadCollaborationData = async () => {
    try {
      // Mock data - in real implementation, this would come from the server
      setActiveUsers(mockActiveUsers)
      setRecentActivity(mockRecentActivity)
      setConflicts(mockConflicts)
      setCommitHistory(mockCommitHistory)
    } catch (error) {
      console.error('Failed to load collaboration data:', error)
    }
  }

  // Update collaboration data (simulating real-time updates)
  const updateCollaborationData = () => {
    // Simulate user activity updates
    setActiveUsers(prev => prev.map(user => ({
      ...user,
      lastSeen: new Date().toISOString()
    })))

    // Simulate new activity
    const newActivity: CollaborationActivity = {
      id: `activity-${Date.now()}`,
      type: 'file-edit',
      user: mockActiveUsers[Math.floor(Math.random() * mockActiveUsers.length)],
      timestamp: new Date().toISOString(),
      description: 'Updated component logic',
      file: 'src/Component.tsx'
    }
    
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)])
  }

  // Handle sharing capsule
  const handleShareCapsule = async (email: string, role: 'collaborator' | 'viewer') => {
    try {
      // Mock invitation - in real implementation, this would send an invitation
      console.log(`Inviting ${email} as ${role}`)
      setShareDialogOpen(false)
    } catch (error) {
      console.error('Failed to share capsule:', error)
    }
  }

  // Handle conflict resolution
  const handleResolveConflict = async (conflictId: string, resolution: 'accept-a' | 'accept-b' | 'merge') => {
    try {
      setConflicts(prev => prev.map(conflict => 
        conflict.id === conflictId 
          ? { ...conflict, status: 'resolved' as const }
          : conflict
      ))
    } catch (error) {
      console.error('Failed to resolve conflict:', error)
    }
  }

  if (!visible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="fixed right-4 bottom-20 bg-slate-800 border border-slate-600/50 rounded-full p-3 text-slate-300 hover:bg-slate-700 transition-colors z-50"
        aria-label="Show collaboration panel"
      >
        👥
      </button>
    )
  }

  return (
    <div className={cn("w-80 border-l border-slate-600/30 bg-slate-800/50 flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-600/30 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center">
          👥 Collaboration
        </h2>
        <div className="flex items-center space-x-2">
          <HaloButton
            size="sm"
            onClick={() => setShareDialogOpen(true)}
            className="px-3 py-1 text-xs"
          >
            Share
          </HaloButton>
          <button
            onClick={onToggleVisibility}
            className="text-slate-400 hover:text-slate-300 p-1"
            aria-label="Hide collaboration panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-600/30">
        <nav className="flex">
          {[
            { id: 'users', label: '👥', title: 'Users', count: activeUsers.length },
            { id: 'activity', label: '📝', title: 'Activity', count: recentActivity.length },
            { id: 'conflicts', label: '⚠️', title: 'Conflicts', count: conflicts.filter(c => c.status === 'pending').length },
            { id: 'history', label: '📚', title: 'History', count: commitHistory.length }
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
              <div className="flex items-center justify-center space-x-1">
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="text-xs bg-slate-600 rounded-full px-1">
                    {tab.count}
                  </span>
                )}
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'users' && (
          <ActiveUsersPanel 
            users={activeUsers}
            onInviteUser={() => setShareDialogOpen(true)}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityPanel activity={recentActivity} />
        )}

        {activeTab === 'conflicts' && (
          <ConflictsPanel 
            conflicts={conflicts}
            onResolveConflict={handleResolveConflict}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPanel history={commitHistory} />
        )}
      </div>

      {/* Share Dialog */}
      {shareDialogOpen && (
        <ShareDialog
          onShare={handleShareCapsule}
          onClose={() => setShareDialogOpen(false)}
        />
      )}
    </div>
  )
}

// Active Users Panel
interface ActiveUsersPanelProps {
  users: CollaborationUser[]
  onInviteUser: () => void
}

const ActiveUsersPanel: React.FC<ActiveUsersPanelProps> = ({
  users,
  onInviteUser
}) => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">
          Active Users ({users.length})
        </h3>
        <HaloButton size="sm" onClick={onInviteUser}>
          Invite
        </HaloButton>
      </div>

      <div className="space-y-3">
        {users.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}

// User Card Component
interface UserCardProps {
  user: CollaborationUser
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400'
      case 'editing': return 'bg-blue-400'
      case 'away': return 'bg-yellow-400'
      default: return 'bg-slate-400'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-yellow-400'
      case 'collaborator': return 'text-green-400'
      case 'viewer': return 'text-slate-400'
      default: return 'text-slate-400'
    }
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
      <div className="relative">
        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-slate-200 text-sm font-medium">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full", getStatusColor(user.status))}></div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-200 truncate">
            {user.name}
          </span>
          <span className={cn("text-xs capitalize", getRoleColor(user.role))}>
            {user.role}
          </span>
        </div>
        
        {user.cursor && (
          <div className="text-xs text-slate-400 truncate">
            Editing {user.cursor.file}
          </div>
        )}
        
        <div className="text-xs text-slate-500">
          {user.status === 'online' ? 'Active now' : `Last seen ${formatRelativeTime(user.lastSeen)}`}
        </div>
      </div>
    </div>
  )
}

// Activity Panel
interface ActivityPanelProps {
  activity: CollaborationActivity[]
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'file-edit': return '✏️'
      case 'file-create': return '📄'
      case 'file-delete': return '🗑️'
      case 'comment': return '💬'
      case 'suggestion': return '💡'
      case 'merge': return '🔀'
      default: return '📝'
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-4">Recent Activity</h3>
      
      <div className="space-y-3">
        {activity.map(item => (
          <div key={item.id} className="flex items-start space-x-3 p-3 bg-slate-700/20 rounded-lg">
            <span className="text-lg">{getActivityIcon(item.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-200">
                <span className="font-medium">{item.user.name}</span> {item.description}
              </div>
              {item.file && (
                <div className="text-xs text-slate-400 mt-1">{item.file}</div>
              )}
              <div className="text-xs text-slate-500 mt-1">
                {formatRelativeTime(item.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Conflicts Panel
interface ConflictsPanelProps {
  conflicts: ConflictResolution[]
  onResolveConflict: (conflictId: string, resolution: 'accept-a' | 'accept-b' | 'merge') => void
}

const ConflictsPanel: React.FC<ConflictsPanelProps> = ({
  conflicts,
  onResolveConflict
}) => {
  const pendingConflicts = conflicts.filter(c => c.status === 'pending')

  if (pendingConflicts.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-2xl mb-2">✅</div>
        <div className="text-sm text-slate-400">No conflicts to resolve</div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-medium text-slate-300">
        Merge Conflicts ({pendingConflicts.length})
      </h3>

      {pendingConflicts.map(conflict => (
        <HaloCard key={conflict.id} className="p-4 border-yellow-400/30">
          <div className="mb-3">
            <div className="text-sm font-medium text-slate-200 mb-1">
              {conflict.file}
            </div>
            <div className="text-xs text-slate-400">
              {conflict.conflicts.length} conflict(s)
            </div>
          </div>

          {conflict.conflicts.map(c => (
            <div key={c.id} className="mb-4 last:mb-0">
              <div className="text-sm text-slate-300 mb-2">{c.description}</div>
              
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
                  <div className="text-xs text-red-400 mb-1">{c.userA.name}</div>
                  <code className="text-xs text-slate-300">{c.changeA}</code>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                  <div className="text-xs text-green-400 mb-1">{c.userB.name}</div>
                  <code className="text-xs text-slate-300">{c.changeB}</code>
                </div>
              </div>

              <div className="flex space-x-2 mt-3">
                <HaloButton
                  size="sm"
                  onClick={() => onResolveConflict(conflict.id, 'accept-a')}
                  className="text-xs"
                >
                  Accept {c.userA.name}
                </HaloButton>
                <HaloButton
                  size="sm"
                  onClick={() => onResolveConflict(conflict.id, 'accept-b')}
                  className="text-xs"
                >
                  Accept {c.userB.name}
                </HaloButton>
                <HaloButton
                  size="sm"
                  variant="outline"
                  onClick={() => onResolveConflict(conflict.id, 'merge')}
                  className="text-xs"
                >
                  Manual Merge
                </HaloButton>
              </div>
            </div>
          ))}
        </HaloCard>
      ))}
    </div>
  )
}

// History Panel
interface HistoryPanelProps {
  history: CommitHistory[]
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history }) => {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-4">Commit History</h3>
      
      <div className="space-y-3">
        {history.map(commit => (
          <div key={commit.id} className="flex items-start space-x-3 p-3 bg-slate-700/20 rounded-lg">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-200 mb-1">
                {commit.message}
              </div>
              <div className="text-xs text-slate-400 mb-1">
                by {commit.author.name} • {formatRelativeTime(commit.timestamp)}
              </div>
              <div className="text-xs text-slate-500">
                {commit.filesChanged.length} file(s) changed • {commit.branch}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Share Dialog
interface ShareDialogProps {
  onShare: (email: string, role: 'collaborator' | 'viewer') => void
  onClose: () => void
}

const ShareDialog: React.FC<ShareDialogProps> = ({ onShare, onClose }) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'collaborator' | 'viewer'>('collaborator')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      onShare(email.trim(), role)
      setEmail('')
    }
  }

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <HaloCard className="w-80 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200">Share Capsule</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'collaborator' | 'viewer')}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
              aria-label="Select role for collaborator"
            >
              <option value="collaborator">Collaborator (can edit)</option>
              <option value="viewer">Viewer (read-only)</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-2">
            <HaloButton type="submit" className="flex-1">
              Send Invitation
            </HaloButton>
            <HaloButton type="button" variant="outline" onClick={onClose}>
              Cancel
            </HaloButton>
          </div>
        </form>
      </HaloCard>
    </div>
  )
}

// Helper function to format relative time
function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return time.toLocaleDateString()
}

// Mock data for demonstration
const mockActiveUsers: CollaborationUser[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@company.com',
    cursor: { line: 42, column: 15, file: 'src/Component.tsx' },
    status: 'editing',
    lastSeen: new Date().toISOString(),
    role: 'owner'
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    email: 'bob@company.com',
    status: 'online',
    lastSeen: new Date(Date.now() - 300000).toISOString(),
    role: 'collaborator'
  },
  {
    id: 'user-3',
    name: 'Carol Brown',
    email: 'carol@company.com',
    status: 'away',
    lastSeen: new Date(Date.now() - 1800000).toISOString(),
    role: 'viewer'
  }
]

const mockRecentActivity: CollaborationActivity[] = [
  {
    id: 'activity-1',
    type: 'file-edit',
    user: mockActiveUsers[0],
    timestamp: new Date(Date.now() - 60000).toISOString(),
    description: 'updated component props',
    file: 'src/Component.tsx'
  },
  {
    id: 'activity-2',
    type: 'comment',
    user: mockActiveUsers[1],
    timestamp: new Date(Date.now() - 300000).toISOString(),
    description: 'added review comment',
    file: 'src/hooks/useData.ts'
  },
  {
    id: 'activity-3',
    type: 'file-create',
    user: mockActiveUsers[0],
    timestamp: new Date(Date.now() - 600000).toISOString(),
    description: 'created new test file',
    file: 'src/Component.test.tsx'
  }
]

const mockConflicts: ConflictResolution[] = [
  {
    id: 'conflict-1',
    file: 'src/Component.tsx',
    conflicts: [
      {
        id: 'c1',
        type: 'content',
        description: 'Different implementations of handleClick',
        userA: mockActiveUsers[0],
        userB: mockActiveUsers[1],
        changeA: 'const handleClick = () => setCount(count + 1)',
        changeB: 'const handleClick = useCallback(() => setCount(prev => prev + 1), [])',
        timestamp: new Date().toISOString()
      }
    ],
    status: 'pending'
  }
]

const mockCommitHistory: CommitHistory[] = [
  {
    id: 'commit-1',
    author: mockActiveUsers[0],
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    message: 'Add responsive design improvements',
    filesChanged: ['src/Component.tsx', 'src/styles.css'],
    branch: 'main'
  },
  {
    id: 'commit-2',
    author: mockActiveUsers[1],
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    message: 'Fix accessibility issues',
    filesChanged: ['src/Component.tsx'],
    branch: 'main'
  },
  {
    id: 'commit-3',
    author: mockActiveUsers[0],
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    message: 'Initial component implementation',
    filesChanged: ['src/Component.tsx', 'src/Component.test.tsx', 'README.md'],
    branch: 'main'
  }
]

export default CollaborationPanel