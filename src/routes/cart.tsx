import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button, Card, Skeleton, toast } from '@blinkdotnew/ui'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2, Plus, Minus, ShoppingCart, ArrowRight, PackageOpen, ArrowLeft,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/types'

export const Route = createFileRoute('/cart')({
  head: () => ({
    meta: [{ title: 'سلة التسوق - سوق قطع الغيار العراقي' }],
  }),
  component: CartPage,
})

function CartPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const {
    cartItems,
    isLoading,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart()

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
          <h2 className="text-xl font-semibold text-foreground mb-2">تسجيل الدخول مطلوب</h2>
          <p className="text-muted-foreground mb-6">يجب تسجيل الدخول للوصول إلى سلة التسوق</p>
          <Button className="bg-accent text-accent-foreground" onClick={() => navigate({ to: '/auth' })}>
            تسجيل الدخول
          </Button>
        </Card>
      </div>
    )
  }

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      await updateQuantity({ cartItemId, quantity: newQuantity })
    } catch (err: any) {
      toast.error('فشل التحديث', { description: err?.message || 'حدث خطأ أثناء تحديث الكمية' })
    }
  }

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId)
      toast('تمت الإزالة', { description: 'تمت إزالة المنتج من السلة' })
    } catch (err: any) {
      toast.error('فشلت الإزالة', { description: err?.message || 'حدث خطأ أثناء إزالة المنتج' })
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCart()
      toast('تم مسح السلة', { description: 'تمت إزالة جميع المنتجات من السلة' })
    } catch (err: any) {
      toast.error('فشل المسح', { description: err?.message || 'حدث خطأ أثناء مسح السلة' })
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="bg-primary">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <Link to="/" className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-4 text-sm">
            <ArrowRight className="h-4 w-4" />
            متابعة التسوق
          </Link>
          <h1 className="text-2xl font-bold text-primary-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            سلة التسوق
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4 flex gap-4">
                <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-8 w-1/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <ShoppingCart className="h-20 w-20 text-muted-foreground/20 mb-6" />
            <h2 className="text-xl font-semibold text-foreground mb-2">السلة فارغة</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              لم تقم بإضافة أي منتجات إلى سلة التسوق بعد. تصفح المنتجات وأضف ما يعجبك.
            </p>
            <Button className="bg-accent text-accent-foreground gap-2" onClick={() => navigate({ to: '/' })}>
              <ArrowLeft className="h-4 w-4" />
              تصفح المنتجات
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {totalItems} منتج{totalItems !== 1 && 'ات'} في السلة
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/80 gap-1"
                  onClick={handleClearCart}
                >
                  <Trash2 className="h-4 w-4" />
                  مسح السلة
                </Button>
              </div>

              <AnimatePresence>
                {cartItems.map((item, index) => {
                  const product = item.product
                  const itemTotal = (product?.price ?? 0) * item.quantity
                  const maxQuantity = product?.quantity ?? 99
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 flex gap-4 border border-border hover:shadow-md transition-shadow">
                        {/* Product Image */}
                        <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-muted to-secondary flex items-center justify-center shrink-0 overflow-hidden">
                          {(() => { try { const imgs = JSON.parse(product?.images || '[]'); return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null } catch { return null } })() ? (
                            <img src={JSON.parse(product?.images || '[]')[0]} alt={product?.name || ''} className="w-full h-full object-cover" />
                          ) : (
                            <PackageOpen className="h-10 w-10 text-muted-foreground/30" />
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
                          <p className="text-sm text-muted-foreground mt-0.5">{product?.brand || ''}</p>
                          <p className="text-lg font-bold text-accent mt-1">{formatPrice(product?.price ?? 0)}</p>
                        </div>

                        {/* Quantity + Remove */}
                        <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="flex items-center border border-border rounded-lg bg-card">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-1.5 hover:bg-muted transition-colors disabled:opacity-40"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-3 font-semibold text-foreground text-sm min-w-[2ch] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= maxQuantity}
                              className="p-1.5 hover:bg-muted transition-colors disabled:opacity-40"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {formatPrice(itemTotal)}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <Card className="p-6 border border-border sticky top-24 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">ملخص الطلب</h2>

                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-[180px]">
                        {item.product?.name || 'منتج'} ×{item.quantity}
                      </span>
                      <span className="font-medium text-foreground">{formatPrice((item.product?.price ?? 0) * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-semibold text-foreground">المجموع الكلي</span>
                  <span className="text-xl font-extrabold text-accent">{formatPrice(totalPrice)}</span>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                  onClick={() => navigate({ to: '/checkout' })}
                >
                  متابعة الدفع
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                <Link
                  to="/"
                  className="block text-center text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  متابعة التسوق
                </Link>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}