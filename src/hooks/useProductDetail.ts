import { useQuery } from '@tanstack/react-query'
import { blink } from '@/blink/client'
import type { Product, Profile } from '@/types'

const productsTable = blink.db.table<Product>('products')
const profilesTable = blink.db.table<Profile>('profiles')

export function useProductDetail(productId: string | undefined) {
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null
      return productsTable.get(productId)
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  })

  const {
    data: seller,
    isLoading: sellerLoading,
    error: sellerError,
  } = useQuery({
    queryKey: ['profile', product?.sellerId],
    queryFn: async () => {
      if (!product?.sellerId) return null
      // sellerId on products is the auth userId, not the profile's auto-generated id
      const results = await profilesTable.list({ where: { userId: product.sellerId }, limit: 1 })
      return results.length > 0 ? results[0] : null
    },
    enabled: !!product?.sellerId,
    staleTime: 5 * 60 * 1000,
  })

  return {
    product: product ?? null,
    seller: seller ?? null,
    isLoading: productLoading || (!!product && sellerLoading),
    error: productError ?? sellerError,
  }
}
