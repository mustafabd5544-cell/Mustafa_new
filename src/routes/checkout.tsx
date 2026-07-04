import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Button, Card, Skeleton, toast, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@blinkdotnew/ui'
import { motion } from 'framer-motion'
import {
  ArrowRight, ShoppingCart, PackageOpen, CreditCard, User, MapPin,
  Phone, AlertTriangle, Loader2, CheckCircle, Wallet, FileText,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useOrders } from '@/hooks/useOrders'
import { useProfile } from '@/hooks/useProfile'
import { formatPrice } from '@/types'

const COMMISSION_RATE = 0.05

export const Route = createFileRoute('/checkout')({
  head: () => ({
    meta: [{ title: 'إتمام الشراء - سوق قطع الغيار العراقي' }],
  }),
  component: CheckoutPage,
})

function CheckoutPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { cartItems, isLoading: cartLoading, totalPrice, isCartEmpty, clearCart } = useCart()
  const { profile, isLoading: profileLoading } = useProfile()
  const { createOrder, isCreating } = useOrders()

  const [notes, setNotes] = useState('')
  const [selectedWallet, setSelectedWallet] = useState<string>(profile?.walletType || '')

  const isLoading = authLoading || cartLoading || profileLoading

  const commission = Math.round(totalPrice * COMMISSION_RATE)
  const grandTotal = totalPrice + commission

  const walletTypeLabel = (type: string) => {
    if (type === 'zaincash') return 'زين كاش'
    if (type === 'fastpay') return 'فاست باي'
    return type
  }

  const hasWalletInfo = !!(profile?.walletType && profile?.walletNumber)
  const isProfileComplete = profile && profile.fullName && profile.phone && profile.governorate && profile.address
  const paymentMethod = selectedWallet || profile?.walletType || ''

  const handleSubmit = async () => {
    if (!cartItems.length) {
      toast.error('السلة فارغة', { description: 'لا توجد منتجات لإتمام الطلب' })
      return
    }
    if (!paymentMethod) {
      toast.error('يرجى اختيار طريقة الدفع', { description: 'يجب تحديد طريقة الدفع لإكمال الطلب' })
      return
    }
    if (!isProfileComplete) {
      toast.error('يرجى إكمال الملف الشخصي', { description: 'يجب إكمال بياناتك الشخصية قبل تقديم الطلب' })
      return
    }

    try {
      await createOrder({ cartItems, paymentMethod, notes: notes.trim() || undefined })
      await clearCart()
      toast.success('تم تأكيد الطلب بنجاح!', { description: 'تم استلام طلبك وسيتم التواصل معك قريباً.' })
      navigate({ to: '/my-orders' })
    } catch (err: any) {
      toast.error('فشل تقديم الطلب', { description: err?.message || 'حدث خطأ أثناء تقديم الطلب، حاول مرة أخرى.' })
    }
  }

  // --- Loading state ---
  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  // --- Not authenticated ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md mx-4">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">تسجيل الدخول مطلوب</h2>
          <p className="text-muted-foreground mb-6">يجب تسجيل الدخول لإتمام عملية الشراء</p>
          <Button className="bg-accent text-accent-foreground" onClick={() => navigate({ to: '/auth' })}>
            تسجيل الدخول
          </Button>
        </Card>
      </div>
    )
  }

  // --- Empty cart ---
  if (!cartLoading && isCartEmpty) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center px-4"
        >
          <ShoppingCart className="h-20 w-20 text-muted-foreground/20 mb-6" />
          <h2 className="text-xl font-semibold text-foreground mb-2">السلة فارغة</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            لا يمكن إتمام الشراء لأن سلة التسوق فارغة. أضف منتجات للسلة أولاً.
          </p>
          <Button className="bg-accent text-accent-foreground gap-2" onClick={() => navigate({ to: '/' })}>
            <ArrowRight className="h-4 w-4" />
            تصفح المنتجات
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="bg-primary">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Link
            to="/cart"
            className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-4 text-sm w-fit"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى السلة
          </Link>
          <h1 className="text-2xl font-bold text-primary-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            إتمام الشراء
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {isLoading ? (
          /* ── Skeleton loading ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 lg:order-2 space-y-4">
              <Skeleton className="h-8 w-48" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4 flex gap-4">
                  <Skeleton className="h-20 w-20 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </Card>
              ))}
            </div>
            <div className="lg:col-span-5 lg:order-1">
              <Card className="p-6 space-y-6">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-12 w-full" />
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ── Order Summary (right side on desktop) ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-7 lg:order-2 space-y-4"
            >
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <PackageOpen className="h-5 w-5 text-accent" />
                ملخص الطلب
                <span className="text-sm font-normal text-muted-foreground">
                  ({cartItems.length} منتج{cartItems.length !== 1 && 'ات'})
                </span>
              </h2>

              <div className="space-y-3">
                {cartItems.map((item, index) => {
                  const product = item.product
                  const itemTotal = (product?.price ?? 0) * item.quantity
                  let imageUrl: string | null = null
                  try {
                    const imgs = JSON.parse(product?.images || '[]')
                    if (Array.isArray(imgs) && imgs.length > 0) imageUrl = imgs[0]
                  } catch { /* noop */ }

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <Card className="p-4 flex gap-4 border border-border hover:shadow-md transition-shadow">
                        {/* Product image */}
                        <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-muted to-secondary flex items-center justify-center shrink-0 overflow-hidden">
                          {imageUrl ? (
                            <img src={imageUrl} alt={product?.name || ''} className="w-full h-full object-cover" />
                          ) : (
                            <PackageOpen className="h-8 w-8 text-muted-foreground/30" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to="/products/$id"
                            params={{ id: item.productId }}
                            className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1"
                          >
                            {product?.name || 'منتج غير متوفر'}
                          </Link>
                          {product?.brand && (
                            <p className="text-sm text-muted-foreground mt-0.5">{product.brand}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">
                              {item.quantity} × {formatPrice(product?.price ?? 0)}
                            </span>
                            <span className="font-bold text-accent">{formatPrice(itemTotal)}</span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* ── Payment section (left side on desktop) ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-5 lg:order-1"
            >
              <Card className="p-6 border border-border space-y-6 sticky top-24">
                {/* Buyer info */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-accent" />
                    معلومات المشتري
                  </h3>

                  {!isProfileComplete && (
                    <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2 text-sm dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">يرجى إكمال ملفك الشخصي أولاً</p>
                        <p className="mt-0.5">بعض البيانات ناقصة. أكملها من صفحة الملف الشخصي.</p>
                        <Link to="/profile" className="text-accent hover:underline font-medium mt-1 inline-block">
                          إكمال الملف الشخصي →
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground min-w-[80px]">الاسم:</span>
                      <span className="font-medium text-foreground">{profile?.fullName || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground min-w-[80px]">الهاتف:</span>
                      <span className="font-medium text-foreground">{profile?.phone || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground min-w-[80px]">المحافظة:</span>
                      <span className="font-medium text-foreground">{profile?.governorate || '—'}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground min-w-[80px] shrink-0">العنوان:</span>
                      <span className="font-medium text-foreground">{profile?.address || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Payment method */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <Wallet className="h-5 w-5 text-accent" />
                    طريقة الدفع
                  </h3>

                  {!hasWalletInfo && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start gap-2 text-sm dark:bg-red-950/30 dark:border-red-800 dark:text-red-200">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">لم يتم إضافة محفظة دفع</p>
                        <p className="mt-0.5">يرجى إضافة محفظة زين كاش أو فاست باي في صفحة الملف الشخصي.</p>
                        <Link to="/profile" className="text-accent hover:underline font-medium mt-1 inline-block">
                          إضافة محفظة →
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        اختر طريقة الدفع
                      </label>
                      <Select
                        value={paymentMethod}
                        onValueChange={(v) => setSelectedWallet(v)}
                        disabled={!hasWalletInfo}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="اختر طريقة الدفع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zaincash">زين كاش</SelectItem>
                          <SelectItem value="fastpay">فاست باي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {hasWalletInfo && (
                      <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/50">
                        <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            رقم محفظة {walletTypeLabel(profile?.walletType || '')}
                          </p>
                          <p className="font-semibold text-foreground font-mono tracking-wider" dir="ltr">
                            {profile?.walletNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-accent" />
                    ملاحظات إضافية
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="اكتب أي ملاحظات تريد إيصالها للبائع..."
                    rows={3}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>

                <div className="border-t border-border" />

                {/* Price breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">عمولة المنصة (5%)</span>
                    <span className="font-medium text-foreground">{formatPrice(commission)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="font-semibold text-foreground">الإجمالي الكلي</span>
                    <span className="text-xl font-extrabold text-accent">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  size="lg"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                  onClick={handleSubmit}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      جاري تقديم الطلب...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      تأكيد الطلب
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  بتأكيدك الطلب، فأنت توافق على شروط وأحكام المنصة.
                </p>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
