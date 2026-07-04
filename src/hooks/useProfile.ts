import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '@/blink/client'
import { useAuth } from '@/hooks/useAuth'
import type { Profile } from '@/types'

const profilesTable = blink.db.table<Profile>('profiles')

export function useProfile() {
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<Profile | null> => {
      if (!userId) return null

      const results = await profilesTable.list({
        where: { userId },
      })

      if (results.length > 0) return results[0]

      // First login — create profile with defaults
      const newProfile = await profilesTable.create({
        userId,
        fullName: '',
        phone: '',
        governorate: '',
        address: '',
        accountType: 'buyer',
        walletNumber: '',
        walletType: '',
        avatarUrl: '',
        rating: 0,
        ratingCount: 0,
      })

      return newProfile
    },
    enabled: !!userId && !authLoading,
    staleTime: 5 * 60 * 1000,
  })

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Pick<Profile, 'fullName' | 'phone' | 'governorate' | 'address' | 'accountType' | 'walletNumber' | 'walletType' | 'avatarUrl'>>) => {
      if (!profile) throw new Error('لا يوجد ملف شخصي للتحديث')
      return profilesTable.update(profile.id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })

  const updateProfile = async (updates: Parameters<typeof updateMutation.mutateAsync>[0]) => {
    return updateMutation.mutateAsync(updates)
  }

  return {
    profile: profile ?? null,
    isLoading: authLoading || isLoading,
    isUpdating: updateMutation.isPending,
    error: error ?? updateMutation.error,
    updateProfile,
  }
}
