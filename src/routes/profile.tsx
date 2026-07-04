import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button, Card, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
  toast, Skeleton,
} from '@blinkdotnew/ui'
import { motion } from 'framer-motion'
import {
  User, MapPin, Phone, CreditCard, Save, ArrowRight,
  Star, Shield, Settings,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { GOVERNORATES } from '@/types'

export const Route = createFileRoute('/profile')({
  head: () => ({
    meta: [{ title: 'الملف الشخصي - سوق قطع الغيار العراقي' }],
  }),
  component: ProfilePage,
})

const profileSchema = z.object({
  fullName: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().min(10, 'رقم هاتف غير صحيح'),
  governorate: z.string().min(1, 'يرجى اختيار المحافظة'),
  address: z.string().min(5, 'يرجى إدخال عنوان صحيح'),
  walletType: z.string().min(1, 'يرجى اختيار نوع المحفظة'),
  walletNumber: z.string().min(1, 'يرجى إدخال رقم المحفظة'),
})

type ProfileForm = z.infer<typeof profileSchema>

function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { profile, isLoading, updateProfile, isUpdating } = useProfile()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)

  const {
    register, handleSubmit, control, reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.fullName || '',
      phone: profile?.phone || '',
      governorate: profile?.governorate || '',
      address: profile?.address || '',
      walletType: profile?.walletType || '',
      walletNumber: profile?.walletNumber || '',
    },
  })

  // Reset form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName,
        phone: profile.phone,
        governorate: profile.governorate,
        address: profile.address,
        walletType: profile.walletType,
        walletNumber: profile.walletNumber,
      })
    }
  }, [profile, reset])

  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md mx-4">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">تسجيل الدخول مطلوب</h2>
          <p className="text-muted-foreground mb-6">يجب تسجيل الدخول لعرض الملف الشخصي</p>
          <Button className="bg-accent text-accent-foreground" onClick={() => navigate({ to: '/auth' })}>
            تسجيل الدخول
          </Button>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <div className="bg-primary">
          <div className="mx-auto max-w-3xl px-4 py-6">
            <Skeleton className="h-5 w-32 bg-primary-foreground/20" />
            <Skeleton className="h-8 w-48 mt-4 bg-primary-foreground/20" />
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!profile) return null

  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateProfile(data)
      toast.success('تم حفظ التغييرات', { description: 'تم تحديث الملف الشخصي بنجاح' })
      setIsEditing(false)
    } catch (err: any) {
      toast.error('فشل الحفظ', { description: err?.message || 'حدث خطأ أثناء حفظ التغييرات' })
    }
  }

  const accountTypeLabel =
    profile.accountType === 'both' ? 'مشتري وبائع' :
    profile.accountType === 'buyer' ? 'مشتري' : 'بائع'

  return (
    <div className="min-h-dvh bg-background">
      <div className="bg-primary">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-4 text-sm"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى الرئيسية
          </button>
          <h1 className="text-2xl font-bold text-primary-foreground">الملف الشخصي</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 border border-border mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-3xl font-bold text-primary-foreground">{profile.fullName?.charAt(0) || '؟'}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{profile.fullName || 'مستخدم جديد'}</h2>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(profile.rating || 0) ? 'fill-accent text-accent' : 'text-border'}`} />
                  ))}
                  <span className="text-sm text-muted-foreground mr-1">{profile.rating || 0} ({profile.ratingCount || 0} تقييم)</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {accountTypeLabel}
                </p>
              </div>
              {!isEditing && (
                <Button variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
                  <Settings className="h-4 w-4" /> تعديل الملف
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        {isEditing ? (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="p-5 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><User className="h-5 w-5 text-accent" /> المعلومات الشخصية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">الاسم الكامل <span className="text-destructive">*</span></label>
                  <Input {...register('fullName')} className={errors.fullName ? 'border-destructive' : ''} />
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">رقم الهاتف <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input {...register('phone')} className={`pr-10 ${errors.phone ? 'border-destructive' : ''}`} />
                  </div>
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">المحافظة <span className="text-destructive">*</span></label>
                  <Controller
                    name="governorate" control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={errors.governorate ? 'border-destructive' : ''}><SelectValue /></SelectTrigger>
                        <SelectContent>{GOVERNORATES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                  />
                  {errors.governorate && <p className="text-sm text-destructive">{errors.governorate.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">العنوان <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input {...register('address')} className={`pr-10 ${errors.address ? 'border-destructive' : ''}`} />
                  </div>
                  {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>
              </div>
            </Card>
            <Card className="p-5 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><CreditCard className="h-5 w-5 text-accent" /> معلومات الدفع</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">نوع المحفظة <span className="text-destructive">*</span></label>
                  <Controller
                    name="walletType" control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={errors.walletType ? 'border-destructive' : ''}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zaincash">زين كاش</SelectItem>
                          <SelectItem value="fastpay">فاست باي</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.walletType && <p className="text-sm text-destructive">{errors.walletType.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">رقم المحفظة <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input {...register('walletNumber')} className={`pr-10 ${errors.walletNumber ? 'border-destructive' : ''}`} />
                  </div>
                  {errors.walletNumber && <p className="text-sm text-destructive">{errors.walletNumber.message}</p>}
                </div>
              </div>
            </Card>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>إلغاء</Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2" disabled={isUpdating}>
                {isUpdating ? <span className="animate-spin h-4 w-4 border-2 border-accent-foreground border-t-transparent rounded-full" /> : <Save className="h-4 w-4" />}
                حفظ التغييرات
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
            <Card className="p-5 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><User className="h-5 w-5 text-accent" /> المعلومات الشخصية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">الاسم الكامل</p><p className="font-semibold text-foreground">{profile.fullName}</p></div>
                <div><p className="text-sm text-muted-foreground">رقم الهاتف</p><p className="font-semibold text-foreground">{profile.phone}</p></div>
                <div><p className="text-sm text-muted-foreground">المحافظة</p><p className="font-semibold text-foreground">{profile.governorate}</p></div>
                <div><p className="text-sm text-muted-foreground">العنوان</p><p className="font-semibold text-foreground">{profile.address}</p></div>
              </div>
            </Card>
            <Card className="p-5 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><CreditCard className="h-5 w-5 text-accent" /> معلومات الدفع</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">نوع المحفظة</p><p className="font-semibold text-foreground">{profile.walletType === 'zaincash' ? 'زين كاش' : profile.walletType === 'fastpay' ? 'فاست باي' : '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">رقم المحفظة</p><p className="font-semibold text-foreground font-mono">{profile.walletNumber}</p></div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
