import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '@/blink/client'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import type { Order } from '@/types'
import type { CartItemWithProduct } from '@/hooks/useCart'

const ordersTable = blink.db.table<Order>('orders')

export function useOrders() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const queryClient = useQueryClient()
  const userId = user?.id

  // Orders where user is the buyer
  const {
    data: buyerOrders = [],
    isLoading: buyerLoading,
    error: buyerError,
  } = useQuery({
    queryKey: ['orders', 'buyer', userId],
    queryFn: async () => {
      if (!userId) return []
      return ordersTable.list({
        where: { buyerId: userId },
        orderBy: { createdAt: 'desc' },
      })
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  })

  // Orders where user is the seller
  const {
    data: sellerOrders = [],
    isLoading: sellerLoading,
    error: sellerError,
  } = useQuery({
    queryKey: ['orders', 'seller', userId],
    queryFn: async () => {
      if (!userId) return []
      return ordersTable.list({
        where: { sellerId: userId },
        orderBy: { createdAt: 'desc' },
      })
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  })

  const createOrderMutation = useMutation({
    mutationFn: async ({
      cartItems,
      paymentMethod,
      notes,
    }: {
      cartItems: CartItemWithProduct[]
      paymentMethod?: string
      notes?: string
    }) => {
      if (!userId) throw new Error('يجب تسجيل الدخول أولاً')
      if (!profile) throw new Error('يجب إكمال الملف الشخصي أولاً')
      if (cartItems.length === 0) throw new Error('السلة فارغة')

      const COMMISSION_RATE = 0.05 // 5% commission

      const newOrders = await Promise.all(
        cartItems.map((item) => {
          const product = item.product
          if (!product) throw new Error('المنتج غير متوفر')

          const totalPrice = product.price * item.quantity
          const commission = Math.round(totalPrice * COMMISSION_RATE)

          return ordersTable.create({
            buyerId: userId,
            sellerId: product.sellerId,
            productId: product.id,
            productName: product.name,
            productPrice: product.price,
            quantity: item.quantity,
            totalPrice,
            commission,
            status: 'pending',
            paymentMethod: paymentMethod || '',
            buyerPhone: profile.phone || '',
            buyerWallet: profile.walletNumber || '',
            notes: notes || '',
          })
        }),
      )

      return newOrders
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'buyer', userId] })
      queryClient.invalidateQueries({ queryKey: ['orders', 'seller', userId] })
      queryClient.invalidateQueries({ queryKey: ['cart', userId] })
    },
  })

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string
      status: Order['status']
    }) => {
      return ordersTable.update(orderId, {
        status,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'buyer', userId] })
      queryClient.invalidateQueries({ queryKey: ['orders', 'seller', userId] })
    },
  })

  return {
    buyerOrders,
    sellerOrders,
    isLoading: buyerLoading || sellerLoading,
    error: buyerError ?? sellerError,
    createOrder: createOrderMutation.mutateAsync,
    updateOrderStatus: updateOrderStatusMutation.mutateAsync,
    isCreating: createOrderMutation.isPending,
    isUpdating: updateOrderStatusMutation.isPending,
  }
}
