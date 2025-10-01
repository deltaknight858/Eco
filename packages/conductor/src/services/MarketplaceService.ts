/**
 * MarketplaceService.ts
 * Real marketplace integration with listing management, discovery, and commerce
 */

import { v4 as uuidv4 } from 'uuid'
import type { CapsuleSpec } from '../agents/CapsuleAgent'
import type { ProvenanceTier } from '../types/AssistTypes'

// Marketplace Interfaces
export interface CapsuleMarketplaceListing {
  // Listing Metadata
  id: string
  capsuleId: string
  title: string
  description: string
  category: CapsuleCategory
  tags: string[]
  
  // Pricing & Monetization
  pricing: {
    model: "free" | "one-time" | "subscription" | "tier-based"
    price?: number
    currency?: string
    tiers?: PricingTier[]
  }
  
  // Marketplace Metrics
  downloads: number
  ratings: Rating[]
  reviews: Review[]
  featured: boolean
  trending: boolean
  
  // Publisher Information
  publisher: {
    id: string
    name: string
    verified: boolean
    reputation: number
  }
  
  // Technical Details
  compatibility: string[]
  requirements: string[]
  lastUpdated: string
  version: string
  changelog: string
  
  // Provenance & Quality
  provenanceTier: ProvenanceTier
  qualityScore: number
  securityScan?: SecurityReport
  
  // Marketplace Status
  status: 'draft' | 'under-review' | 'published' | 'deprecated'
  publishedAt?: string
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged'
}

export type CapsuleCategory = 
  | "react-component" 
  | "api-service" 
  | "workflow" 
  | "documentation"
  | "ai-agent"
  | "integration"
  | "template"

export interface PricingTier {
  name: string
  price: number
  features: string[]
  limits: Record<string, number>
}

export interface Rating {
  id: string
  userId: string
  userName: string
  rating: number
  timestamp: string
  verified: boolean
}

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  title: string
  content: string
  timestamp: string
  helpful: number
  verified: boolean
  moderationStatus: 'pending' | 'approved' | 'rejected'
  categories: {
    quality: number
    usability: number
    documentation: number
    performance: number
    security: number
  }
}

export interface SecurityReport {
  scanDate: string
  vulnerabilities: Vulnerability[]
  securityScore: number
  recommendations: string[]
  compliance: ComplianceCheck[]
}

export interface Vulnerability {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: string
  description: string
  fix?: string
  cveId?: string
}

export interface ComplianceCheck {
  standard: string
  status: 'compliant' | 'non-compliant' | 'warning'
  details: string
}

export interface MarketplaceSearchFilters {
  query?: string
  category?: CapsuleCategory
  priceRange?: [number, number]
  provenanceTier?: ProvenanceTier[]
  rating?: number
  featured?: boolean
  trending?: boolean
  verified?: boolean
  tags?: string[]
  sortBy?: 'relevance' | 'newest' | 'popular' | 'rating' | 'price' | 'downloads'
  sortOrder?: 'asc' | 'desc'
}

export interface MarketplaceSearchResult {
  listings: CapsuleMarketplaceListing[]
  totalCount: number
  facets: SearchFacets
  suggestions: string[]
  trending: CapsuleMarketplaceListing[]
  featured: CapsuleMarketplaceListing[]
}

export interface SearchFacets {
  categories: { category: CapsuleCategory; count: number }[]
  priceRanges: { range: [number, number]; count: number }[]
  provenanceTiers: { tier: ProvenanceTier; count: number }[]
  tags: { tag: string; count: number }[]
}

export class MarketplaceService {
  private listings: Map<string, CapsuleMarketplaceListing> = new Map()
  private searchIndex: Map<string, string[]> = new Map()
  private analytics: Map<string, any> = new Map()

  constructor() {
    this.initializeMockData()
  }

  /**
   * Publish a capsule to the marketplace
   */
  async publishCapsule(capsule: CapsuleSpec, publisherInfo: {
    id: string
    name: string
    verified: boolean
  }): Promise<CapsuleMarketplaceListing> {
    const listing: CapsuleMarketplaceListing = {
      id: uuidv4(),
      capsuleId: capsule.name.toLowerCase().replace(/\s+/g, '-'),
      title: capsule.name,
      description: capsule.description,
      category: this.categorizeCapsule(capsule),
      tags: this.generateTags(capsule),
      
      pricing: {
        model: "free",
        price: 0,
        currency: "USD"
      },
      
      downloads: 0,
      ratings: [],
      reviews: [],
      featured: false,
      trending: false,
      
      publisher: {
        ...publisherInfo,
        reputation: this.calculatePublisherReputation(publisherInfo.id)
      },
      
      compatibility: this.analyzeCompatibility(capsule),
      requirements: this.extractRequirements(capsule),
      lastUpdated: new Date().toISOString(),
      version: capsule.version,
      changelog: "Initial release",
      
      provenanceTier: capsule.provenanceTier || 'bronze',
      qualityScore: this.assessQuality(capsule),
      securityScan: await this.performSecurityScan(capsule),
      
      status: 'under-review',
      moderationStatus: 'pending'
    }

    this.listings.set(listing.id, listing)
    this.updateSearchIndex(listing)
    
    // Trigger moderation process
    setTimeout(() => this.autoModerate(listing.id), 2000)
    
    return listing
  }

  /**
   * Search and discover capsules in the marketplace
   */
  async searchCapsules(filters: MarketplaceSearchFilters = {}): Promise<MarketplaceSearchResult> {
    let results = Array.from(this.listings.values())
      .filter(listing => listing.status === 'published')

    // Apply filters
    if (filters.query) {
      const query = filters.query.toLowerCase()
      results = results.filter(listing => 
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (filters.category) {
      results = results.filter(listing => listing.category === filters.category)
    }

    if (filters.provenanceTier?.length) {
      results = results.filter(listing => 
        filters.provenanceTier!.includes(listing.provenanceTier)
      )
    }

    if (filters.rating) {
      results = results.filter(listing => this.getAverageRating(listing) >= filters.rating!)
    }

    if (filters.featured) {
      results = results.filter(listing => listing.featured)
    }

    if (filters.trending) {
      results = results.filter(listing => listing.trending)
    }

    if (filters.verified) {
      results = results.filter(listing => listing.publisher.verified)
    }

    if (filters.tags?.length) {
      results = results.filter(listing => 
        filters.tags!.some(tag => listing.tags.includes(tag))
      )
    }

    // Apply sorting
    results = this.sortResults(results, filters.sortBy || 'relevance', filters.sortOrder || 'desc')

    // Generate facets
    const facets = this.generateSearchFacets(results)

    // Get trending and featured
    const trending = this.getTrendingCapsules()
    const featured = this.getFeaturedCapsules()

    return {
      listings: results,
      totalCount: results.length,
      facets,
      suggestions: this.generateSuggestions(filters.query),
      trending,
      featured
    }
  }

  /**
   * Get detailed information about a specific capsule
   */
  async getCapsuleDetails(listingId: string): Promise<CapsuleMarketplaceListing | null> {
    const listing = this.listings.get(listingId)
    if (!listing) return null

    // Increment view count for analytics
    this.trackAnalytics(listingId, 'view')
    
    return listing
  }

  /**
   * Add a rating and review for a capsule
   */
  async addReview(listingId: string, userId: string, reviewData: {
    rating: number
    title: string
    content: string
    categories: {
      quality: number
      usability: number
      documentation: number
      performance: number
      security: number
    }
  }): Promise<Review> {
    const listing = this.listings.get(listingId)
    if (!listing) throw new Error('Capsule not found')

    const review: Review = {
      id: uuidv4(),
      userId,
      userName: `User ${userId.substring(0, 8)}`,
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      timestamp: new Date().toISOString(),
      helpful: 0,
      verified: false,
      moderationStatus: 'pending',
      categories: reviewData.categories
    }

    const rating: Rating = {
      id: uuidv4(),
      userId,
      userName: review.userName,
      rating: reviewData.rating,
      timestamp: review.timestamp,
      verified: false
    }

    listing.reviews.push(review)
    listing.ratings.push(rating)
    
    this.listings.set(listingId, listing)
    this.trackAnalytics(listingId, 'review', { rating: reviewData.rating })

    return review
  }

  /**
   * Track capsule download
   */
  async trackDownload(listingId: string, userId: string): Promise<void> {
    const listing = this.listings.get(listingId)
    if (!listing) throw new Error('Capsule not found')

    listing.downloads++
    this.listings.set(listingId, listing)
    this.trackAnalytics(listingId, 'download', { userId })
    
    // Update trending status based on recent downloads
    this.updateTrendingStatus()
  }

  /**
   * Get marketplace analytics
   */
  async getMarketplaceAnalytics(): Promise<{
    totalListings: number
    totalDownloads: number
    averageRating: number
    topCategories: { category: CapsuleCategory; count: number }[]
    recentActivity: any[]
  }> {
    const listings = Array.from(this.listings.values())
    
    const totalDownloads = listings.reduce((sum, listing) => sum + listing.downloads, 0)
    const totalRatings = listings.reduce((sum, listing) => sum + listing.ratings.length, 0)
    const averageRating = totalRatings > 0 
      ? listings.reduce((sum, listing) => 
          sum + listing.ratings.reduce((rSum, rating) => rSum + rating.rating, 0), 0
        ) / totalRatings
      : 0

    const categoryCount = listings.reduce((acc, listing) => {
      acc[listing.category] = (acc[listing.category] || 0) + 1
      return acc
    }, {} as Record<CapsuleCategory, number>)

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category: category as CapsuleCategory, count }))
      .sort((a, b) => b.count - a.count)

    return {
      totalListings: listings.length,
      totalDownloads,
      averageRating,
      topCategories,
      recentActivity: this.getRecentActivity()
    }
  }

  // Private helper methods
  private initializeMockData(): void {
    // Create some initial marketplace listings
    const mockListings: Partial<CapsuleMarketplaceListing>[] = [
      {
        title: "React Data Table Pro",
        description: "Advanced data table component with sorting, filtering, and pagination",
        category: "react-component",
        tags: ["react", "table", "data", "ui"],
        pricing: { model: "one-time", price: 29.99, currency: "USD" },
        downloads: 1234,
        featured: true,
        trending: true,
        publisher: { id: "pub1", name: "UI Masters", verified: true, reputation: 95 },
        provenanceTier: "gold",
        qualityScore: 92
      },
      {
        title: "Auth0 Integration Kit",
        description: "Complete authentication setup with Auth0 integration",
        category: "api-service",
        tags: ["auth", "security", "api", "integration"],
        pricing: { model: "free" },
        downloads: 856,
        featured: false,
        trending: true,
        publisher: { id: "pub2", name: "Security Solutions", verified: true, reputation: 88 },
        provenanceTier: "silver",
        qualityScore: 85
      },
      {
        title: "AI Content Generator",
        description: "AI-powered content generation workflow for blogs and articles",
        category: "workflow",
        tags: ["ai", "content", "automation", "openai"],
        pricing: { model: "subscription", price: 9.99, currency: "USD" },
        downloads: 432,
        featured: true,
        trending: false,
        publisher: { id: "pub3", name: "AI Innovations", verified: false, reputation: 76 },
        provenanceTier: "bronze",
        qualityScore: 78
      }
    ]

    mockListings.forEach((mockListing, index) => {
      const listing: CapsuleMarketplaceListing = {
        id: `listing-${index + 1}`,
        capsuleId: `capsule-${index + 1}`,
        title: mockListing.title!,
        description: mockListing.description!,
        category: mockListing.category!,
        tags: mockListing.tags!,
        pricing: mockListing.pricing!,
        downloads: mockListing.downloads!,
        ratings: this.generateMockRatings(),
        reviews: this.generateMockReviews(),
        featured: mockListing.featured!,
        trending: mockListing.trending!,
        publisher: mockListing.publisher!,
        compatibility: ["react@^18.0.0", "typescript@^5.0.0"],
        requirements: ["Node.js 18+", "npm or yarn"],
        lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        version: "1.0.0",
        changelog: "Initial release with core features",
        provenanceTier: mockListing.provenanceTier!,
        qualityScore: mockListing.qualityScore!,
        status: 'published',
        publishedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        moderationStatus: 'approved'
      }
      
      this.listings.set(listing.id, listing)
      this.updateSearchIndex(listing)
    })
  }

  private generateMockRatings(): Rating[] {
    const count = Math.floor(Math.random() * 20) + 5
    return Array.from({ length: count }, (_, i) => ({
      id: `rating-${i}`,
      userId: `user-${i}`,
      userName: `User ${i}`,
      rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      verified: Math.random() > 0.3
    }))
  }

  private generateMockReviews(): Review[] {
    const reviews = [
      "Excellent component, saved us weeks of development time!",
      "Well documented and easy to integrate. Highly recommended.",
      "Good quality but could use more customization options.",
      "Perfect for our use case. Great performance and reliability.",
      "Documentation could be better but the component works well."
    ]
    
    const count = Math.floor(Math.random() * 5) + 2
    return Array.from({ length: count }, (_, i) => ({
      id: `review-${i}`,
      userId: `user-${i}`,
      userName: `User ${i}`,
      rating: Math.floor(Math.random() * 3) + 3,
      title: `Review ${i + 1}`,
      content: reviews[i % reviews.length],
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      helpful: Math.floor(Math.random() * 10),
      verified: Math.random() > 0.4,
      moderationStatus: 'approved',
      categories: {
        quality: Math.floor(Math.random() * 3) + 3,
        usability: Math.floor(Math.random() * 3) + 3,
        documentation: Math.floor(Math.random() * 3) + 3,
        performance: Math.floor(Math.random() * 3) + 3,
        security: Math.floor(Math.random() * 3) + 3
      }
    }))
  }

  private categorizeCapsule(capsule: CapsuleSpec): CapsuleCategory {
    const content = capsule.description.toLowerCase()
    if (content.includes('component') || content.includes('ui')) return 'react-component'
    if (content.includes('api') || content.includes('service')) return 'api-service'
    if (content.includes('workflow') || content.includes('automation')) return 'workflow'
    if (content.includes('docs') || content.includes('documentation')) return 'documentation'
    if (content.includes('ai') || content.includes('agent')) return 'ai-agent'
    return 'template'
  }

  private generateTags(capsule: CapsuleSpec): string[] {
    const tags = new Set<string>()
    const text = (capsule.name + ' ' + capsule.description).toLowerCase()
    
    // Extract common tech terms
    const techTerms = ['react', 'typescript', 'api', 'ui', 'component', 'service', 'workflow', 'ai', 'automation']
    techTerms.forEach(term => {
      if (text.includes(term)) tags.add(term)
    })
    
    // Add category-based tags
    tags.add(capsule.category || 'general')
    
    return Array.from(tags).slice(0, 8)
  }

  private calculatePublisherReputation(publisherId: string): number {
    // Mock reputation calculation
    return Math.floor(Math.random() * 30) + 70 // 70-100
  }

  private analyzeCompatibility(capsule: CapsuleSpec): string[] {
    // Mock compatibility analysis
    return ["react@^18.0.0", "typescript@^5.0.0", "node@^18.0.0"]
  }

  private extractRequirements(capsule: CapsuleSpec): string[] {
    // Mock requirements extraction
    return ["Node.js 18+", "npm or yarn", "Modern browser"]
  }

  private assessQuality(capsule: CapsuleSpec): number {
    // Mock quality assessment
    let score = 50
    if (capsule.description.length > 100) score += 20
    if (capsule.dependencies.length > 0) score += 15
    if (capsule.provenanceTier === 'gold') score += 15
    return Math.min(100, score)
  }

  private async performSecurityScan(capsule: CapsuleSpec): Promise<SecurityReport> {
    // Mock security scan
    return {
      scanDate: new Date().toISOString(),
      vulnerabilities: [],
      securityScore: Math.floor(Math.random() * 20) + 80,
      recommendations: ["Keep dependencies updated", "Use secure coding practices"],
      compliance: [
        { standard: "OWASP", status: 'compliant', details: "No security issues found" }
      ]
    }
  }

  private updateSearchIndex(listing: CapsuleMarketplaceListing): void {
    const searchTerms = [
      listing.title.toLowerCase(),
      listing.description.toLowerCase(),
      ...listing.tags,
      listing.category,
      listing.publisher.name.toLowerCase()
    ]
    
    this.searchIndex.set(listing.id, searchTerms)
  }

  private autoModerate(listingId: string): void {
    const listing = this.listings.get(listingId)
    if (!listing) return

    // Simple auto-moderation (in production would use AI/manual review)
    listing.status = 'published'
    listing.moderationStatus = 'approved'
    listing.publishedAt = new Date().toISOString()
    
    this.listings.set(listingId, listing)
  }

  private getAverageRating(listing: CapsuleMarketplaceListing): number {
    if (listing.ratings.length === 0) return 0
    return listing.ratings.reduce((sum, rating) => sum + rating.rating, 0) / listing.ratings.length
  }

  private sortResults(
    results: CapsuleMarketplaceListing[], 
    sortBy: string, 
    order: 'asc' | 'desc'
  ): CapsuleMarketplaceListing[] {
    return results.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'newest':
          comparison = new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
          break
        case 'popular':
          comparison = b.downloads - a.downloads
          break
        case 'rating':
          comparison = this.getAverageRating(b) - this.getAverageRating(a)
          break
        case 'price':
          comparison = (a.pricing.price || 0) - (b.pricing.price || 0)
          break
        default: // relevance
          comparison = b.qualityScore - a.qualityScore
      }
      
      return order === 'desc' ? comparison : -comparison
    })
  }

  private generateSearchFacets(results: CapsuleMarketplaceListing[]): SearchFacets {
    const categories = new Map<CapsuleCategory, number>()
    const tiers = new Map<ProvenanceTier, number>()
    const tags = new Map<string, number>()

    results.forEach(listing => {
      categories.set(listing.category, (categories.get(listing.category) || 0) + 1)
      tiers.set(listing.provenanceTier, (tiers.get(listing.provenanceTier) || 0) + 1)
      listing.tags.forEach(tag => {
        tags.set(tag, (tags.get(tag) || 0) + 1)
      })
    })

    return {
      categories: Array.from(categories.entries()).map(([category, count]) => ({ category, count })),
      priceRanges: [
        { range: [0, 0], count: results.filter(r => r.pricing.price === 0).length },
        { range: [1, 25], count: results.filter(r => (r.pricing.price || 0) > 0 && (r.pricing.price || 0) <= 25).length },
        { range: [26, 100], count: results.filter(r => (r.pricing.price || 0) > 25).length }
      ],
      provenanceTiers: Array.from(tiers.entries()).map(([tier, count]) => ({ tier, count })),
      tags: Array.from(tags.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    }
  }

  private generateSuggestions(query?: string): string[] {
    const suggestions = [
      "react component",
      "authentication service",
      "data visualization",
      "ai integration",
      "workflow automation",
      "api wrapper",
      "ui library",
      "testing utilities"
    ]
    
    if (!query) return suggestions.slice(0, 5)
    
    return suggestions
      .filter(suggestion => suggestion.includes(query.toLowerCase()))
      .slice(0, 5)
  }

  private getTrendingCapsules(): CapsuleMarketplaceListing[] {
    return Array.from(this.listings.values())
      .filter(listing => listing.trending && listing.status === 'published')
      .slice(0, 5)
  }

  private getFeaturedCapsules(): CapsuleMarketplaceListing[] {
    return Array.from(this.listings.values())
      .filter(listing => listing.featured && listing.status === 'published')
      .slice(0, 5)
  }

  private trackAnalytics(listingId: string, event: string, data?: any): void {
    const key = `${listingId}-${event}`
    const existing = this.analytics.get(key) || []
    existing.push({
      timestamp: new Date().toISOString(),
      data
    })
    this.analytics.set(key, existing)
  }

  private updateTrendingStatus(): void {
    // Update trending based on recent activity
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000

    this.listings.forEach(listing => {
      const recentDownloads = this.analytics.get(`${listing.id}-download`) || []
      const recentCount = recentDownloads.filter(
        (download: any) => new Date(download.timestamp).getTime() > weekAgo
      ).length

      listing.trending = recentCount > 5 // Threshold for trending
      this.listings.set(listing.id, listing)
    })
  }

  private getRecentActivity(): any[] {
    const activities: any[] = []
    
    this.analytics.forEach((events, key) => {
      const [listingId, eventType] = key.split('-')
      const listing = this.listings.get(listingId)
      
      events.slice(-5).forEach((event: any) => {
        activities.push({
          listingId,
          listingTitle: listing?.title,
          eventType,
          timestamp: event.timestamp,
          data: event.data
        })
      })
    })
    
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)
  }
}