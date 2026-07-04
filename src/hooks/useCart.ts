import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '@/blink/client'
import { useAuth } from '@/hooks/useAuth'
import type { CartItem, Product } from '@/types'

const cartTable = blink.db.table<CartItem>('cart_items')
const productsTable = blink.db.table<Product>('products')

export interface CartItemWithProduct extends CartItem {
  product: Product | null
}

export function useCart() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id

  const {
    data: cartItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['cart', userId],
    queryFn: async (): Promise<CartItemWithProduct[]> => {
      if (!userId) return []

      const items = await cartTable.list({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })

      if (items.length === 0) return []

      // Enrich with product details
      const productIds = [...new Set(items.map((i) => i.productId))]
      const products = await Promise.all(
        productIds.map((pid) => productsTable.get(pid)),
      )
      const productMap = new Map<string, Product | null>()
      products.forEach((p) => {
        if (p) productMap.set(p.id, p)
      })

      return items.map((item) => ({
        ...item,
        product: productMap.get(item.productId) ?? null,
      }))
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  })

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
    }: {
      productId: string
      quantity?: number
    }): Promise<CartItem> => {
      if (!userId) throw new Error('يجب تسجيل الدخول أولاً')

      // Check if product already in cart — increment quantity
      const existing = await cartTable.list({
        where: { AND: [{ userId }, { productId }] },
      })

      if (existing.length > 0) {
        const item = existing[0]
        return cartTable.update(item.id, {
          quantity: item.quantity + quantity,
        })
      }

      return cartTable.create({
        userId,
        productId,
        quantity,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] })
    },
  })

  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      cartItemId,
      quantity,
    }: {
      cartItemId: string
      quantity: number
    }) => {
      if (quantity <= 0) {
        return cartTable.delete(cartItemId)
      }
      return cartTable.update(cartItemId, { quantity })
    },
    onMutate: async ({ cartItemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart', userId] })
      const previous = queryClient.getQueryData<CartItemWithProduct[]>(['cart', userId])

      queryClient.setQueryData<CartItemWithProduct[]>(['cart', userId], (old) => {
        if (!old) return old
        if (quantity <= 0) {
          return old.filter((item) => item.id !== cartItemId)
        }
        return old.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item,
        )
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['cart', userId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] })
    },
  })

  const removeFromCartMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      return cartTable.delete(cartItemId)
    },
    onMutate: async (cartItemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart', userId] })
      const previous = queryClient.getQueryData<CartItemWithProduct[]>(['cart', userId])

      queryClient.setQueryData<CartItemWithProduct[]>(['cart', userId], (old) => {
        if (!old) return old
        return old.filter((item) => item.id !== cartItemId)
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['cart', userId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] })
    },
  })

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return
      const items = await cartTable.list({ where: { userId } })
      await Promise.all(items.map((item) => cartTable.delete(item.id)))
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['cart', userId] })
      const previous = queryClient.getQueryData<CartItemWithProduct[]>(['cart', userId])
      queryClient.setQueryData(['cart', userId], [])
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['cart', userId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] })
    },
  })

  // Computed cart totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0,
  )

  return {
    cartItems,
    isLoading,
    error,
    totalItems,
    totalPrice,
    isCartEmpty: cartItems.length === 0,
    addToCart: addToCartMutation.mutateAsync,
    updateQuantity: updateQuantityMutation.mutateAsync,
    removeFromCart: removeFromCartMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    isAdding: addToCartMutation.isPending,
  }
}
