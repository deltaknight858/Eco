# 🎭 VISUAL PRIMITIVES & NEON-GLASS BLUEPRINT (TD-2025-006)

## **💎 COMMIT 36: NEON-GLASS ICON SYSTEM**

### **Goal:** Transform icons into cinematic, provenance-aware primitives

### **The Vision:**

```typescript
// Neon-glass icons with dynamic provenance states
interface NeonGlassIconProps {
  icon: React.ReactNode;
  tier?: 'bronze' | 'silver' | 'gold';
  status?: 'idle' | 'active' | 'error' | 'success';
  intensity?: number; // 0-1 for activity level
  streamEnabled?: boolean;
  crown?: boolean; // Show provenance crown
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Icons respond to agent activity and provenance
const iconStates = {
  idle: { glow: 0.3, pulse: false },
  active: { glow: 0.8, pulse: true },
  error: { glow: 0.9, pulse: true, color: 'red' },
  success: { glow: 1.0, pulse: false, color: 'green' }
};
```

### **Implementation Tasks:**

#### **1. Core Icon System**

```tsx
// Base NeonGlassIcon component
export const NeonGlassIcon: React.FC<NeonGlassIconProps> = ({
  icon,
  tier = 'bronze',
  status = 'idle',
  intensity = 0.5,
  streamEnabled = false,
  crown = false,
  size = 'md',
  className,
  ...props
}) => {
  const tierColors = {
    bronze: 'from-orange-400 to-orange-600',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600'
  };
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };
  
  const glowIntensity = iconStates[status].glow * intensity;
  const shouldPulse = iconStates[status].pulse && streamEnabled;
  
  return (
    <div 
      className={cn(
        'relative inline-flex items-center justify-center',
        'rounded-lg backdrop-blur-sm border',
        'transition-all duration-300 ease-out',
        sizeClasses[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
        borderImage: `linear-gradient(135deg, ${tierColors[tier]}) 1`,
        boxShadow: shouldPulse 
          ? `0 0 ${20 * glowIntensity}px rgba(255,255,255,${glowIntensity})` 
          : `0 0 ${10 * glowIntensity}px rgba(255,255,255,${glowIntensity * 0.5})`
      }}
      {...props}
    >
      {/* Icon Content */}
      <div className={cn(
        'transition-transform duration-200',
        shouldPulse && 'animate-pulse'
      )}>
        {icon}
      </div>
      
      {/* Provenance Crown */}
      {crown && tier === 'gold' && (
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
            <span className="text-xs">👑</span>
          </div>
        </div>
      )}
      
      {/* Activity Pulse */}
      {streamEnabled && status === 'active' && (
        <div className="absolute inset-0 rounded-lg animate-ping opacity-30">
          <div 
            className="w-full h-full rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${tierColors[tier]})`
            }}
          />
        </div>
      )}
    </div>
  );
};
```

#### **2. Icon Library with Provenance**

```tsx
// Eco-specific icon set
export const EcoIcons = {
  Memory: ({ tier, ...props }: NeonGlassIconProps) => (
    <NeonGlassIcon 
      icon={<Brain className="w-6 h-6" />} 
      tier={tier} 
      {...props} 
    />
  ),
  
  Capsule: ({ tier, ...props }: NeonGlassIconProps) => (
    <NeonGlassIcon 
      icon={<Package className="w-6 h-6" />} 
      tier={tier} 
      {...props} 
    />
  ),
  
  Pathways: ({ tier, ...props }: NeonGlassIconProps) => (
    <NeonGlassIcon 
      icon={<Map className="w-6 h-6" />} 
      tier={tier} 
      {...props} 
    />
  ),
  
  Marketplace: ({ tier, ...props }: NeonGlassIconProps) => (
    <NeonGlassIcon 
      icon={<Store className="w-6 h-6" />} 
      tier={tier} 
      {...props} 
    />
  ),
  
  Deploy: ({ tier, ...props }: NeonGlassIconProps) => (
    <NeonGlassIcon 
      icon={<Rocket className="w-6 h-6" />} 
      tier={tier} 
      {...props} 
    />
  ),
  
  Agent: ({ tier, ...props }: NeonGlassIconProps) => (
    <NeonGlassIcon 
      icon={<Bot className="w-6 h-6" />} 
      tier={tier} 
      {...props} 
    />
  )
};
```

#### **3. Stream-Responsive Icons**

```tsx
// Icons that respond to conductor events
export const StreamingIconGrid: React.FC = () => {
  const { events } = useAgentStream();
  const [iconStates, setIconStates] = useState<Record<string, any>>({});
  
  useEffect(() => {
    events.forEach(event => {
      if (event.type === 'agent') {
        setIconStates(prev => ({
          ...prev,
          [event.agent]: {
            status: event.payload?.state || 'active',
            tier: event.provenanceTier || 'bronze',
            lastActivity: Date.now()
          }
        }));
        
        // Reset to idle after 3 seconds
        setTimeout(() => {
          setIconStates(prev => ({
            ...prev,
            [event.agent]: { ...prev[event.agent], status: 'idle' }
          }));
        }, 3000);
      }
    });
  }, [events]);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(EcoIcons).map(([name, IconComponent]) => {
        const state = iconStates[name.toLowerCase()] || { status: 'idle', tier: 'bronze' };
        
        return (
          <div key={name} className="flex flex-col items-center gap-2">
            <IconComponent
              tier={state.tier}
              status={state.status}
              streamEnabled={true}
              crown={state.tier === 'gold'}
            />
            <span className="text-xs text-gray-400">{name}</span>
          </div>
        );
      })}
    </div>
  );
};
```

---

## **🎨 COMMIT 37: VISUAL PRIMITIVES PACKAGE**

### **Goal:** Create reusable, tier-aware visual components

### **The Vision:**

```typescript
// Visual primitives with built-in provenance
interface VisualPrimitiveProps {
  tier: 'bronze' | 'silver' | 'gold';
  variant?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  children?: React.ReactNode;
}

// Primitive categories
const primitiveCategories = {
  frames: ['BasicFrame', 'NeonFrame', 'GlassFrame', 'ProvenanceFrame'],
  tiles: ['InfoTile', 'StatusTile', 'MetricTile', 'ActionTile'],
  circles: ['StatusCircle', 'ProgressCircle', 'AvatarCircle', 'IconCircle'],
  dashboards: ['MetricsDashboard', 'ActivityDashboard', 'ProvenceDashboard']
};
```

### **Implementation Tasks:**

#### **1. Frame Primitives**

```tsx
// NeonFrame - signature glass morphism container
export const NeonFrame: React.FC<VisualPrimitiveProps> = ({
  tier = 'bronze',
  variant = 'default',
  size = 'md',
  animated = false,
  children,
  className,
  ...props
}) => {
  const tierGradients = {
    bronze: 'from-orange-500/20 via-amber-500/10 to-orange-600/20',
    silver: 'from-gray-400/20 via-slate-300/10 to-gray-500/20',
    gold: 'from-yellow-500/20 via-amber-400/10 to-yellow-600/20'
  };
  
  const sizeClasses = {
    sm: 'p-4 rounded-lg',
    md: 'p-6 rounded-xl',
    lg: 'p-8 rounded-2xl'
  };
  
  return (
    <div
      className={cn(
        'relative backdrop-blur-md border border-white/10',
        'shadow-2xl shadow-black/20',
        sizeClasses[size],
        animated && 'transition-all duration-500 hover:scale-105',
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${tierGradients[tier]})`,
        backdropFilter: 'blur(20px) saturate(180%)'
      }}
      {...props}
    >
      {/* Tier indicator */}
      <div className="absolute top-2 right-2">
        <div className={cn(
          'w-2 h-2 rounded-full',
          tier === 'bronze' && 'bg-orange-500',
          tier === 'silver' && 'bg-gray-400',
          tier === 'gold' && 'bg-yellow-500'
        )} />
      </div>
      
      {children}
    </div>
  );
};

// ProvenanceFrame - frame with explicit tier display
export const ProvenanceFrame: React.FC<VisualPrimitiveProps & {
  title?: string;
  verified?: boolean;
}> = ({ tier, title, verified, children, ...props }) => {
  return (
    <NeonFrame tier={tier} {...props}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">{title}</h3>
          <div className="flex items-center gap-2">
            <ProvenanceBadge tier={tier} />
            {verified && <VerificationIcon tier={tier} />}
          </div>
        </div>
      )}
      {children}
    </NeonFrame>
  );
};
```

#### **2. Tile System**

```tsx
// StatusTile - shows agent/system status
export const StatusTile: React.FC<VisualPrimitiveProps & {
  title: string;
  status: 'active' | 'idle' | 'error' | 'success';
  value?: string | number;
  icon?: React.ReactNode;
}> = ({ tier, title, status, value, icon, ...props }) => {
  const statusColors = {
    active: 'text-blue-400 bg-blue-500/20',
    idle: 'text-gray-400 bg-gray-500/20',
    error: 'text-red-400 bg-red-500/20',
    success: 'text-green-400 bg-green-500/20'
  };
  
  return (
    <NeonFrame tier={tier} size="sm" {...props}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-300">{title}</h4>
          {value && (
            <p className="text-lg font-bold text-white mt-1">{value}</p>
          )}
        </div>
        <div className={cn(
          'flex items-center gap-2 px-2 py-1 rounded text-xs',
          statusColors[status]
        )}>
          {icon}
          {status}
        </div>
      </div>
    </NeonFrame>
  );
};

// MetricTile - displays quantitative data
export const MetricTile: React.FC<VisualPrimitiveProps & {
  label: string;
  value: number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}> = ({ tier, label, value, unit, change, trend, ...props }) => {
  return (
    <NeonFrame tier={tier} size="sm" {...props}>
      <div className="space-y-2">
        <p className="text-sm text-gray-400">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">{value}</span>
          {unit && <span className="text-sm text-gray-400">{unit}</span>}
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs',
            trend === 'up' && 'text-green-400',
            trend === 'down' && 'text-red-400',
            trend === 'stable' && 'text-gray-400'
          )}>
            {trend === 'up' && '↗️'}
            {trend === 'down' && '↘️'}
            {trend === 'stable' && '→'}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </NeonFrame>
  );
};
```

#### **3. Circle Primitives**

```tsx
// ProgressCircle - animated progress indicator
export const ProgressCircle: React.FC<VisualPrimitiveProps & {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
}> = ({ 
  tier, 
  progress, 
  size = 80, 
  strokeWidth = 8, 
  showValue = true,
  ...props 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  const tierColors = {
    bronze: '#f97316',
    silver: '#94a3b8',
    gold: '#eab308'
  };
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tierColors[tier]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};

// StatusCircle - simple status indicator
export const StatusCircle: React.FC<{
  status: 'active' | 'idle' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}> = ({ status, size = 'md', pulse = false }) => {
  const statusColors = {
    active: 'bg-blue-500',
    idle: 'bg-gray-500',
    error: 'bg-red-500',
    success: 'bg-green-500'
  };
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };
  
  return (
    <div className={cn(
      'rounded-full',
      statusColors[status],
      sizeClasses[size],
      pulse && 'animate-pulse'
    )} />
  );
};
```

### **Success Metric:** Visual primitives used across all Eco apps with consistent tier-aware styling

---

## **📦 COMMIT 38: STORYBOOK GALLERY**

### **Goal:** Interactive showcase of all visual primitives

### **Implementation Tasks:**

#### **1. Primitive Showcase Stories**

```tsx
// NeonFrame.stories.tsx
import { NeonFrame } from '../primitives/NeonFrame';

export default {
  title: 'Eco/Primitives/Frames',
  component: NeonFrame,
  parameters: {
    docs: {
      description: {
        component: 'Signature glass morphism frame with tier-aware styling'
      }
    }
  }
};

export const AllTiers = () => (
  <div className="grid grid-cols-3 gap-8">
    <NeonFrame tier="bronze">
      <h3>Bronze Frame</h3>
      <p>Standard tier with warm orange glow</p>
    </NeonFrame>
    
    <NeonFrame tier="silver">
      <h3>Silver Frame</h3>
      <p>Professional tier with cool silver glow</p>
    </NeonFrame>
    
    <NeonFrame tier="gold">
      <h3>Gold Frame</h3>
      <p>Premium tier with prestigious gold glow</p>
    </NeonFrame>
  </div>
);

export const WithProvenance = () => (
  <ProvenanceFrame 
    tier="gold" 
    title="Verified Component"
    verified={true}
  >
    <StatusTile
      tier="gold"
      title="Downloads"
      status="success"
      value="1,234"
      icon={<Download className="w-4 h-4" />}
    />
  </ProvenanceFrame>
);

export const Interactive = {
  args: {
    tier: 'gold',
    animated: true
  },
  argTypes: {
    tier: {
      control: { type: 'select' },
      options: ['bronze', 'silver', 'gold']
    },
    animated: {
      control: { type: 'boolean' }
    }
  }
};
```

#### **2. Complete Primitive Gallery**

```tsx
// PrimitiveGallery.stories.tsx
export const CompletePrimitiveShowcase = () => (
  <div className="space-y-8">
    <section>
      <h2 className="text-xl font-bold mb-4">Frames</h2>
      <div className="grid grid-cols-2 gap-4">
        <NeonFrame tier="bronze">Bronze Frame</NeonFrame>
        <NeonFrame tier="silver">Silver Frame</NeonFrame>
        <NeonFrame tier="gold">Gold Frame</NeonFrame>
        <ProvenanceFrame tier="gold" title="Verified" verified>
          Provenance Frame
        </ProvenanceFrame>
      </div>
    </section>
    
    <section>
      <h2 className="text-xl font-bold mb-4">Tiles</h2>
      <div className="grid grid-cols-3 gap-4">
        <StatusTile 
          tier="bronze" 
          title="Memory Nodes" 
          status="active" 
          value="156" 
        />
        <MetricTile 
          tier="silver" 
          label="Capsules Created" 
          value={23} 
          change={12} 
          trend="up" 
        />
        <StatusTile 
          tier="gold" 
          title="Agent Status" 
          status="success" 
          value="Online" 
        />
      </div>
    </section>
    
    <section>
      <h2 className="text-xl font-bold mb-4">Circles</h2>
      <div className="flex items-center gap-8">
        <ProgressCircle tier="bronze" progress={45} />
        <ProgressCircle tier="silver" progress={78} />
        <ProgressCircle tier="gold" progress={92} />
        <div className="flex items-center gap-2">
          <StatusCircle status="active" pulse />
          <StatusCircle status="success" />
          <StatusCircle status="error" />
          <StatusCircle status="idle" />
        </div>
      </div>
    </section>
  </div>
);
```

---

## **🌟 STRATEGIC IMPACT**

### **For Contributors:**
- **Consistent visual language** — All Eco apps use same primitives
- **Provenance awareness** — Every visual element shows tier status
- **Interactive feedback** — Icons and components respond to system state
- **Professional polish** — Glass morphism creates premium feel

### **For the Platform:**
- **Brand differentiation** — Unique neon-glass visual identity
- **Component reuse** — Faster development across all apps
- **Visual hierarchy** — Provenance tiers create clear quality signals
- **Streaming integration** — UI comes alive with real-time updates

### **Technical Excellence:**
- **Design system foundation** — Scalable primitive library
- **Performance optimized** — Efficient animations and effects
- **Accessibility built-in** — Screen reader support and keyboard navigation
- **Theme-aware** — Consistent styling across light/dark modes

**The Visual Primitives system transforms Eco from a functional platform into a cinematic experience where every interaction feels intentional, beautiful, and alive.** 💎✨