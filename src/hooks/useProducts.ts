import { useQuery } from '@tanstack/react-query'
import { blink } from '@/blink/client'
import type { Product, Profile } from '@/types'

const productsTable = blink.db.table<Product>('products')
const profilesTable = blink.db.table<Profile>('profiles')

export interface ProductFilters {
  brand?: string
  category?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  governorate?: string
  sellerId?: string
  isOriginal?: 'original' | 'aftermarket'
  negotiable?: boolean
}

export function useProducts(filters: ProductFilters = {}) {
  const {
    brand,
    category,
    condition,
    minPrice,
    maxPrice,
    search,
    governorate,
    sellerId,
    isOriginal,
    negotiable,
  } = filters

  return useQuery({
    queryKey: ['products', filters],
    queryFn: async (): Promise<Product[]> => {
      // Build where conditions for direct DB filtering
      const conditions: Record<string, unknown>[] = [
        { status: 'published' },
      ]

      if (brand) conditions.push({ brand })
      if (category) conditions.push({ category })
      if (condition) conditions.push({ condition })
      if (sellerId) conditions.push({ sellerId })
      if (isOriginal) conditions.push({ isOriginal })
      if (negotiable !== undefined) conditions.push({ negotiable: negotiable ? '1' : '0' })

      let products = await productsTable.list({
        where: { AND: conditions },
        orderBy: { createdAt: 'desc' },
        limit: 200,
      })

      // Client-side filtering for range + search + governorate
      // Price range filter
      if (minPrice !== undefined) {
        products = products.filter((p) => p.price >= minPrice)
      }
      if (maxPrice !== undefined) {
        products = products.filter((p) => p.price <= maxPrice)
      }

      // Text search filter (name, brand, model, description, partNumber)
      if (search) {
        const q = search.toLowerCase()
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.model.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.partNumber.toLowerCase().includes(q),
        )
      }

      // Governorate filter — fetch seller profiles and match
      // sellerId on products is the auth userId, not the profile's auto-generated id
      if (governorate) {
        const sellerIds = [...new Set(products.map((p) => p.sellerId))]
        const sellerResults = await Promise.all(
          sellerIds.map((sid) =>
            profilesTable.list({ where: { userId: sid }, limit: 1 }),
          ),
        )
        const sellerMap = new Map<string, Profile>()
        sellerIds.forEach((sid, i) => {
          const result = sellerResults[i]
          if (result && result.length > 0) {
            sellerMap.set(sid, result[0])
          }
        })

        products = products.filter((p) => {
          const seller = sellerMap.get(p.sellerId)
          return seller?.governorate === governorate
        })
      }

      return products
    },
    staleTime: 2 * 60 * 1000,
  })
}
