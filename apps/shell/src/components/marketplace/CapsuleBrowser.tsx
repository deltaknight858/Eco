/**
 * CapsuleBrowser.tsx
 * Advanced marketplace browsing interface with discovery and filtering
 */

import React, { useState, useEffect, useMemo } from 'react'
import { cn, HaloCard, HaloBadge, HaloButton } from '@eco/halo-components'
import type { CapsuleMarketplaceListing, MarketplaceSearchFilters } from '../../../../../packages/conductor/src/services/MarketplaceService'
import { useConductor } from '../hooks/useConductor'

// Component Interfaces
interface CapsuleBrowserProps {
  onCapsuleSelect?: (capsule: CapsuleMarketplaceListing) => void
  onInstall?: (capsule: CapsuleMarketplaceListing) => void
  className?: string
}

interface FilterPanelProps {
  filters: MarketplaceSearchFilters
  onFiltersChange: (filters: MarketplaceSearchFilters) => void
  facets?: any
}

interface CapsuleGridProps {
  capsules: CapsuleMarketplaceListing[]
  onCapsuleSelect?: (capsule: CapsuleMarketplaceListing) => void
  onInstall?: (capsule: CapsuleMarketplaceListing) => void
  loading?: boolean
}

interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: () => void
  suggestions?: string[]
}

// Main CapsuleBrowser Component
export const CapsuleBrowser: React.FC<CapsuleBrowserProps> = ({
  onCapsuleSelect,
  onInstall,
  className
}) => {
  const { conductor } = useConductor()
  const [searchResults, setSearchResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<MarketplaceSearchFilters>({
    query: '',
    sortBy: 'relevance',
    sortOrder: 'desc'
  })

  // Search capsules
  const searchCapsules = async () => {
    if (!conductor) return

    setLoading(true)
    try {
      // Use CapsuleAgent to search marketplace
      const response = await conductor.sendMessage(
        `search marketplace "${filters.query}" with filters: ${JSON.stringify(filters)}`
      )
      
      // Parse response and simulate marketplace data
      setSearchResults({
        listings: mockCapsuleListings.filter(listing => 
          !filters.query || 
          listing.title.toLowerCase().includes(filters.query.toLowerCase()) ||
          listing.description.toLowerCase().includes(filters.query.toLowerCase())
        ),
        totalCount: mockCapsuleListings.length,
        featured: mockCapsuleListings.filter(l => l.featured),
        trending: mockCapsuleListings.filter(l => l.trending),
        facets: {
          categories: [
            { category: 'react-component', count: 15 },
            { category: 'api-service', count: 8 },
            { category: 'workflow', count: 5 },
            { category: 'documentation', count: 3 }
          ],
          provenanceTiers: [
            { tier: 'gold', count: 12 },
            { tier: 'silver', count: 18 },
            { tier: 'bronze', count: 8 }
          ]
        }
      })
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial search
  useEffect(() => {
    searchCapsules()
  }, [conductor])

  // Handle filter changes
  const handleFiltersChange = (newFilters: MarketplaceSearchFilters) => {
    setFilters(newFilters)
  }

  // Handle search
  const handleSearch = () => {
    searchCapsules()
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-6 border-b border-slate-600/30">
        <h1 className="text-2xl font-bold text-slate-200 mb-2">
          Capsule Marketplace
        </h1>
        <p className="text-slate-400">
          Discover and install provenance-verified capsules from the community
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-6 border-b border-slate-600/30">
        <SearchBar
          query={filters.query || ''}
          onQueryChange={(query) => setFilters({ ...filters, query })}
          onSearch={handleSearch}
          suggestions={['react component', 'authentication', 'data visualization']}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Filter Panel */}
        <div className="w-80 border-r border-slate-600/30 p-6 overflow-y-auto">
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            facets={searchResults?.facets}
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {/* Featured Section */}
          {searchResults?.featured?.length > 0 && (
            <div className="p-6 border-b border-slate-600/30">
              <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                ⭐ Featured Capsules
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {searchResults.featured.slice(0, 3).map((capsule: CapsuleMarketplaceListing) => (
                  <FeaturedCapsuleCard
                    key={capsule.id}
                    capsule={capsule}
                    onSelect={() => onCapsuleSelect?.(capsule)}
                    onInstall={() => onInstall?.(capsule)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-200">
                {searchResults?.totalCount || 0} Results
                {filters.query && (
                  <span className="text-slate-400 font-normal ml-2">
                    for "{filters.query}"
                  </span>
                )}
              </h2>
              
              <div className="flex items-center space-x-4">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="px-3 py-1 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 text-sm"
                  aria-label="Sort results by"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            <CapsuleGrid
              capsules={searchResults?.listings || []}
              onCapsuleSelect={onCapsuleSelect}
              onInstall={onInstall}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Search Bar Component
const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onSearch,
  suggestions = []
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false)

  return (
    <div className="relative">
      <div className="flex space-x-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Search capsules..."
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
            aria-label="Search capsules"
          />
          
          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && query.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600/50 rounded-lg shadow-lg z-10">
              {suggestions
                .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 5)
                .map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onQueryChange(suggestion)
                    setShowSuggestions(false)
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700/50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <HaloButton onClick={onSearch} variant="primary">
          Search
        </HaloButton>
      </div>
    </div>
  )
}

// Filter Panel Component
const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  facets
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-200">Filters</h3>

      {/* Categories */}
      {facets?.categories && (
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">Category</h4>
          <div className="space-y-2">
            {facets.categories.map((category: any) => (
              <label key={category.category} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.category === category.category}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    category: e.target.checked ? category.category : undefined
                  })}
                  className="rounded border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400/20"
                />
                <span className="text-slate-300 text-sm">
                  {category.category.replace('-', ' ')} ({category.count})
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Provenance Tier */}
      {facets?.provenanceTiers && (
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">Provenance Tier</h4>
          <div className="space-y-2">
            {facets.provenanceTiers.map((tier: any) => (
              <label key={tier.tier} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.provenanceTier?.includes(tier.tier)}
                  onChange={(e) => {
                    const current = filters.provenanceTier || []
                    const updated = e.target.checked
                      ? [...current, tier.tier]
                      : current.filter(t => t !== tier.tier)
                    onFiltersChange({
                      ...filters,
                      provenanceTier: updated.length > 0 ? updated : undefined
                    })
                  }}
                  className="rounded border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400/20"
                />
                <div className="flex items-center space-x-2">
                  <HaloBadge tier={tier.tier}>{tier.tier}</HaloBadge>
                  <span className="text-slate-300 text-sm">({tier.count})</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Pricing */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-3">Pricing</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="pricing"
              checked={filters.priceRange?.[1] === 0}
              onChange={() => onFiltersChange({
                ...filters,
                priceRange: [0, 0]
              })}
              className="border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400/20"
            />
            <span className="text-slate-300 text-sm">Free</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="pricing"
              checked={filters.priceRange?.[0] === 1}
              onChange={() => onFiltersChange({
                ...filters,
                priceRange: [1, 999]
              })}
              className="border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400/20"
            />
            <span className="text-slate-300 text-sm">Paid</span>
          </label>
        </div>
      </div>

      {/* Other Filters */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-3">Features</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.featured}
              onChange={(e) => onFiltersChange({
                ...filters,
                featured: e.target.checked || undefined
              })}
              className="rounded border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400/20"
            />
            <span className="text-slate-300 text-sm">Featured</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.trending}
              onChange={(e) => onFiltersChange({
                ...filters,
                trending: e.target.checked || undefined
              })}
              className="rounded border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400/20"
            />
            <span className="text-slate-300 text-sm">Trending</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.verified}
              onChange={(e) => onFiltersChange({
                ...filters,
                verified: e.target.checked || undefined
              })}
              className="rounded border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400/20"
            />
            <span className="text-slate-300 text-sm">Verified Publisher</span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      <HaloButton
        variant="ghost"
        onClick={() => onFiltersChange({ query: '', sortBy: 'relevance', sortOrder: 'desc' })}
        className="w-full"
      >
        Clear All Filters
      </HaloButton>
    </div>
  )
}

// Capsule Grid Component
const CapsuleGrid: React.FC<CapsuleGridProps> = ({
  capsules,
  onCapsuleSelect,
  onInstall,
  loading
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-slate-700/50 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (capsules.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-slate-300 mb-2">No capsules found</h3>
        <p className="text-slate-400">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {capsules.map(capsule => (
        <CapsuleCard
          key={capsule.id}
          capsule={capsule}
          onSelect={() => onCapsuleSelect?.(capsule)}
          onInstall={() => onInstall?.(capsule)}
        />
      ))}
    </div>
  )
}

// Individual Capsule Card
interface CapsuleCardProps {
  capsule: CapsuleMarketplaceListing
  onSelect?: () => void
  onInstall?: () => void
}

const CapsuleCard: React.FC<CapsuleCardProps> = ({
  capsule,
  onSelect,
  onInstall
}) => {
  const averageRating = capsule.ratings.length > 0
    ? capsule.ratings.reduce((sum, r) => sum + r.rating, 0) / capsule.ratings.length
    : 0

  return (
    <HaloCard className="hover:scale-105 transition-transform cursor-pointer" onClick={onSelect}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-200 mb-1">
              {capsule.title}
            </h3>
            <p className="text-sm text-slate-400">by {capsule.publisher.name}</p>
          </div>
          {capsule.featured && (
            <div className="text-yellow-400 text-sm">⭐</div>
          )}
        </div>

        {/* Description */}
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">
          {capsule.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <HaloBadge tier={capsule.provenanceTier}>{capsule.provenanceTier}</HaloBadge>
          <span className="px-2 py-1 bg-slate-700/50 text-xs text-slate-300 rounded">
            {capsule.category.replace('-', ' ')}
          </span>
          {capsule.publisher.verified && (
            <span className="px-2 py-1 bg-green-500/20 text-xs text-green-400 rounded">
              ✓ Verified
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
          <div className="flex items-center space-x-4">
            <span>📥 {capsule.downloads.toLocaleString()}</span>
            {averageRating > 0 && (
              <span>⭐ {averageRating.toFixed(1)}</span>
            )}
          </div>
          <div className="text-slate-500">
            v{capsule.version}
          </div>
        </div>

        {/* Price and Install */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-slate-200">
            {capsule.pricing.model === 'free' ? (
              'Free'
            ) : (
              `$${capsule.pricing.price}`
            )}
          </div>
          <HaloButton
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onInstall?.()
            }}
          >
            Install
          </HaloButton>
        </div>
      </div>
    </HaloCard>
  )
}

// Featured Capsule Card (larger format)
const FeaturedCapsuleCard: React.FC<CapsuleCardProps> = ({
  capsule,
  onSelect,
  onInstall
}) => {
  return (
    <HaloCard className="hover:scale-105 transition-transform cursor-pointer border-cyan-400/30" onClick={onSelect}>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-yellow-400 text-sm">⭐ FEATURED</span>
          <HaloBadge tier={capsule.provenanceTier}>{capsule.provenanceTier}</HaloBadge>
        </div>
        
        <h3 className="text-xl font-bold text-slate-200 mb-2">
          {capsule.title}
        </h3>
        <p className="text-slate-300 mb-4">
          {capsule.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            {capsule.downloads.toLocaleString()} downloads
          </div>
          <HaloButton
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onInstall?.()
            }}
          >
            Install
          </HaloButton>
        </div>
      </div>
    </HaloCard>
  )
}

// Mock data for demonstration
const mockCapsuleListings: CapsuleMarketplaceListing[] = [
  {
    id: 'listing-1',
    capsuleId: 'react-data-table-pro',
    title: 'React Data Table Pro',
    description: 'Advanced data table component with sorting, filtering, and pagination',
    category: 'react-component',
    tags: ['react', 'table', 'data', 'ui'],
    pricing: { model: 'one-time', price: 29.99, currency: 'USD' },
    downloads: 1234,
    ratings: [
      { id: '1', userId: 'u1', userName: 'Dev1', rating: 5, timestamp: '2025-01-01', verified: true }
    ],
    reviews: [],
    featured: true,
    trending: true,
    publisher: { id: 'pub1', name: 'UI Masters', verified: true, reputation: 95 },
    compatibility: ['react@^18.0.0'],
    requirements: ['Node.js 18+'],
    lastUpdated: '2025-01-01',
    version: '1.0.0',
    changelog: 'Initial release',
    provenanceTier: 'gold',
    qualityScore: 92,
    status: 'published',
    publishedAt: '2025-01-01',
    moderationStatus: 'approved'
  },
  {
    id: 'listing-2', 
    capsuleId: 'auth0-integration',
    title: 'Auth0 Integration Kit',
    description: 'Complete authentication setup with Auth0 integration',
    category: 'api-service',
    tags: ['auth', 'security', 'api'],
    pricing: { model: 'free' },
    downloads: 856,
    ratings: [
      { id: '2', userId: 'u2', userName: 'Dev2', rating: 4, timestamp: '2025-01-01', verified: true }
    ],
    reviews: [],
    featured: false,
    trending: true,
    publisher: { id: 'pub2', name: 'Security Solutions', verified: true, reputation: 88 },
    compatibility: ['node@^18.0.0'],
    requirements: ['Node.js 18+'],
    lastUpdated: '2025-01-01',
    version: '1.0.0',
    changelog: 'Initial release',
    provenanceTier: 'silver',
    qualityScore: 85,
    status: 'published',
    publishedAt: '2025-01-01',
    moderationStatus: 'approved'
  }
]

export default CapsuleBrowser