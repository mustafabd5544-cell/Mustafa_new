import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button, Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Skeleton, toast } from '@blinkdotnew/ui'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, PackageOpen, Clock, CheckCircle, XCircle, Truck,
  ShoppingBag, Store, Phone, AlertCircle, Ban, Star, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useOrders } from '@/hooks/useOrders'
import { useRatings } from '@/hooks/useRatings'
import { ORDER_STATUS_LABELS, formatPrice } from '@/types'
import type { Order } from '@/types'

export const Route = createFileRoute('/my-orders')({
  head: () => ({
    meta: [{ title: 'طلباتي - سوق قطع الغيار العراقي' }],
  }),
  component: MyOrdersPage,
})

const STATUS_ICONS: Record<string, React.FC<{ className?: string }>> = {
  pending: Clock,
  paid: CheckCircle,
  processing: PackageOpen,
  delivered: Truck,
  completed: CheckCircle,
  cancelled: XCircle,
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  paid: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

function RatingSection({ order }: { order: Order }) {
  const { useOrderRating, rateOrder, isRating } = useRatings()
  const { data: existingRating, isLoading: ratingLoading } = useOrderRating(order.id)
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmitRating = async () => {
    if (selectedRating < 1) {
      toast.error('يرجى اختيار تقييم', { description: 'يجب اختيار عدد النجوم قبل الإرسال' })
      return
    }
    try {
      await rateOrder(order.id, order.sellerId, selectedRating, comment)
      toast.success('تم إرسال التقييم', { description: 'شكراً لتقييمك! تم تحديث تقييم البائع.' })
      setComment('')
    } catch (err: any) {
      toast.error('فشل التقييم', { description: err?.message || 'حدث خطأ أثناء إرسال التقييم' })
    }
  }

  if (ratingLoading) {
    return null
  }

  const hasRated = !!existingRating

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors w-full"
      >
        <Star className="h-4 w-4" />
        {hasRated ? 'تم التقييم' : 'تقييم البائع'}
        {isOpen ? <ChevronUp className="h-4 w-4 mr-auto" /> : <ChevronDown className="h-4 w-4 mr-auto" />}
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 space-y-3"
        >
          {/* Stars */}
          <div className="flex items-center gap-1 justify-center" dir="ltr">
            {Array.from({ length: 5 }).map((_, i) => {
              const starValue = i + 1
              const isFilled = hasRated
                ? starValue <= Number(existingRating!.rating)
                : starValue <= (hoveredStar || selectedRating)

              return (
                <button
                  key={i}
                  type="button"
                  disabled={hasRated}
                  onMouseEnter={() => !hasRated && setHoveredStar(starValue)}
                  onMouseLeave={() => !hasRated && setHoveredStar(0)}
                  onClick={() => !hasRated && setSelectedRating(starValue)}
                  className={`transition-all duration-150 ${hasRated ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      isFilled
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          {/* Rating label */}
          {!hasRated && selectedRating > 0 && (
            <p className="text-center text-sm text-amber-600 font-medium">
              {selectedRating === 5 ? 'ممتاز' : selectedRating === 4 ? 'جيد جداً' : selectedRating === 3 ? 'جيد' : selectedRating === 2 ? 'مقبول' : 'سيء'}
            </p>
          )}

          {/* Comment */}
          {hasRated ? (
            existingRating!.comment ? (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">{existingRating!.comment}</p>
              </div>
            ) : null
          ) : (
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب تعليقك عن البائع (اختياري)..."
              rows={3}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          )}

          {/* Submit button */}
          {!hasRated && (
            <Button
              size="sm"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
              onClick={handleSubmitRating}
              disabled={isRating || selectedRating < 1}
            >
              {isRating ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Star className="h-4 w-4 fill-white" />
              )}
              إرسال التقييم
            </Button>
          )}
        </motion.div>
      )}
    </div>
  )
}

function OrderCard({
  order,
  isSeller,
  onUpdateStatus,
}: {
  order: Order
  isSeller: boolean
  onUpdateStatus: (orderId: string, status: Order['status']) => Promise<void>
}) {
  const StatusIcon = STATUS_ICONS[order.status] || Clock
  const statusStyle = STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-800 border-gray-200'
  const canCancel = order.status === 'pending' && !isSeller
  const canAccept = order.status === 'pending' && isSeller
  const canMarkProcessing = order.status === 'paid' && isSeller
  const showRating = order.status === 'completed' && !isSeller

  const handleCancel = async () => {
    try {
      await onUpdateStatus(order.id, 'cancelled')
      toast('تم إلغاء الطلب', { description: 'تم إلغاء طلبك بنجاح' })
    } catch (err: any) {
      toast.error('فشل الإلغاء', { description: err?.message || 'حدث خطأ أثناء إلغاء الطلب' })
    }
  }

  const handleAccept = async () => {
    try {
      await onUpdateStatus(order.id, 'paid')
      toast.success('تم قبول الطلب', { description: 'تم تأكيد الطلب وسيتم تجهيزه قريباً' })
    } catch (err: any) {
      toast.error('فشل القبول', { description: err?.message || 'حدث خطأ أثناء قبول الطلب' })
    }
  }

  const handleMarkProcessing = async () => {
    try {
      await onUpdateStatus(order.id, 'processing')
      toast.success('تم تحديث الحالة', { description: 'تم تحديث حالة الطلب إلى قيد التجهيز' })
    } catch (err: any) {
      toast.error('فشل التحديث', { description: err?.message || 'حدث خطأ أثناء تحديث الحالة' })
    }
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('ar-IQ', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
    >
      <Card className="p-4 border border-border hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Link
              to="/products/$id"
              params={{ id: order.productId }}
              className="font-semibold text-foreground hover:text-accent transition-colors"
            >
              {order.productName}
            </Link>
          </div>
          <Badge variant="secondary" className={`border text-xs px-2.5 py-1 shrink-0 ${statusStyle}`}>
            <StatusIcon className="h-3.5 w-3.5 ml-1" />
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">السعر</p>
            <p className="font-semibold text-foreground">{formatPrice(order.productPrice)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">الكمية</p>
            <p className="font-semibold text-foreground">{order.quantity}</p>
          </div>
          <div>
            <p className="text-muted-foreground">الإجمالي</p>
            <p className="font-semibold text-accent">{formatPrice(order.totalPrice)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">التاريخ</p>
            <p className="font-medium text-foreground text-xs">{orderDate}</p>
          </div>
        </div>

        {isSeller && (
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>رقم المشتري: {order.buyerPhone}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
          {canCancel && (
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-1.5" onClick={handleCancel}>
              <Ban className="h-3.5 w-3.5" />
              إلغاء الطلب
            </Button>
          )}
          {canAccept && (
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5" onClick={handleAccept}>
              <CheckCircle className="h-3.5 w-3.5" />
              قبول الطلب
            </Button>
          )}
          {canMarkProcessing && (
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5" onClick={handleMarkProcessing}>
              <PackageOpen className="h-3.5 w-3.5" />
              بدء التجهيز
            </Button>
          )}
        </div>

        {/* Rating section for completed buyer orders */}
        {showRating && <RatingSection order={order} />}
      </Card>
    </motion.div>
  )
}

function OrdersList({
  orders,
  isLoading,
  emptyTitle,
  emptyDesc,
  isSeller,
  onUpdateStatus,
}: {
  orders: Order[]
  isLoading: boolean
  emptyTitle: string
  emptyDesc: string
  isSeller: boolean
  onUpdateStatus: (orderId: string, status: Order['status']) => Promise<void>
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </Card>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        {isSeller ? (
          <Store className="h-16 w-16 text-muted-foreground/20 mb-4" />
        ) : (
          <ShoppingBag className="h-16 w-16 text-muted-foreground/20 mb-4" />
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2">{emptyTitle}</h3>
        <p className="text-muted-foreground max-w-sm">{emptyDesc}</p>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} isSeller={isSeller} onUpdateStatus={onUpdateStatus} />
        ))}
      </div>
    </AnimatePresence>
  )
}

function MyOrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { buyerOrders, sellerOrders, isLoading, updateOrderStatus } = useOrders()
  const [activeTab, setActiveTab] = useState('buyer')

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
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">تسجيل الدخول مطلوب</h2>
          <p className="text-muted-foreground mb-6">يجب تسجيل الدخول لعرض طلباتك</p>
          <Button className="bg-accent text-accent-foreground" onClick={() => navigate({ to: '/auth' })}>
            تسجيل الدخول
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="bg-primary">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-4 text-sm"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى الرئيسية
          </button>
          <h1 className="text-2xl font-bold text-primary-foreground">طلباتي</h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="buyer" className="flex-1 gap-2">
              <ShoppingBag className="h-4 w-4" />
              طلباتي
            </TabsTrigger>
            <TabsTrigger value="seller" className="flex-1 gap-2">
              <Store className="h-4 w-4" />
              مبيعاتي
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buyer">
            <OrdersList
              orders={buyerOrders}
              isLoading={isLoading}
              isSeller={false}
              emptyTitle="لا توجد طلبات"
              emptyDesc="لم تقم بأي عملية شراء بعد. تصفح المنتجات وابدأ التسوق الآن."
              onUpdateStatus={updateOrderStatus}
            />
          </TabsContent>

          <TabsContent value="seller">
            <OrdersList
              orders={sellerOrders}
              isLoading={isLoading}
              isSeller={true}
              emptyTitle="لا توجد مبيعات"
              emptyDesc="لم تستقبل أي طلبات شراء بعد. أضف إعلاناتك لجذب المشترين."
              onUpdateStatus={updateOrderStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
