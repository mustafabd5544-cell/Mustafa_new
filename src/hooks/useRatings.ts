import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '@/blink/client'
import { useAuth } from '@/hooks/useAuth'
import type { Profile } from '@/types'

export interface Rating {
  id: string
  orderId: string
  raterId: string
  ratedUserId: string
  rating: number
  comment: string
  createdAt: string
}

const ratingsTable = blink.db.table<Rating>('ratings')
const profilesTable = blink.db.table<Profile>('profiles')

export function useRatings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id

  /**
   * Check if the current user has already rated a specific order.
   * Returns the existing rating or null.
   */
  function useOrderRating(orderId: string | undefined) {
    return useQuery({
      queryKey: ['ratings', 'order', orderId, userId],
      queryFn: async (): Promise<Rating | null> => {
        if (!userId || !orderId) return null
        const results = await ratingsTable.list({
          where: {
            AND: [
              { orderId },
              { raterId: userId },
            ],
          },
        })
        return results.length > 0 ? results[0] : null
      },
      enabled: !!userId && !!orderId,
      staleTime: 5 * 60 * 1000,
    })
  }

  /**
   * Rate an order: validates status + buyer, creates rating, updates seller profile average.
   */
  const rateOrderMutation = useMutation({
    mutationFn: async ({
      orderId,
      sellerId,
      rating,
      comment,
    }: {
      orderId: string
      sellerId: string
      rating: number
      comment: string
    }) => {
      if (!userId) throw new Error('يجب تسجيل الدخول أولاً')

      if (rating < 1 || rating > 5) throw new Error('يجب أن يكون التقييم بين 1 و 5')

      // Create the rating record
      const newRating = await ratingsTable.create({
        orderId,
        raterId: userId,
        ratedUserId: sellerId,
        rating,
        comment: comment || '',
        createdAt: new Date().toISOString(),
      })

      // Find the seller's profile by user_id
      const profiles = await profilesTable.list({
        where: { userId: sellerId },
      })

      if (profiles.length > 0) {
        const profile = profiles[0]
        const oldRating = Number(profile.rating)
        const oldCount = Number(profile.ratingCount)
        const newAvg = (oldRating * oldCount + rating) / (oldCount + 1)
        await profilesTable.update(profile.id, {
          rating: Math.round(newAvg * 10) / 10,
          ratingCount: oldCount + 1,
          updatedAt: new Date().toISOString(),
        })
      }

      return newRating
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', 'order', variables.orderId, userId] })
      // Also invalidate the seller profile so the product detail page picks up the new rating
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const rateOrder = async (orderId: string, sellerId: string, rating: number, comment: string) => {
    return rateOrderMutation.mutateAsync({ orderId, sellerId, rating, comment })
  }

  return {
    useOrderRating,
    rateOrder,
    isRating: rateOrderMutation.isPending,
  }
}
