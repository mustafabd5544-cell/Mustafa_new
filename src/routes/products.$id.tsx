import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'
import { Button, Badge, Card, Skeleton, toast } from '@blinkdotnew/ui'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  PackageOpen,
  Car,
  Tag,
  Eye,
  MapPin,
  Phone,
  Star,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  Warehouse,
  Hash,
  BadgeCheck,
  AlertCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useProductDetail } from '@/hooks/useProductDetail'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { CONDITION_LABELS, formatPrice } from '@/types'

// ── Condition badge styles ──────────────────────────────────────────
const CONDITION_STYLES: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  excellent_used: 'bg-sky-100 text-sky-800 border-sky-200',
  good: 'bg-amber-100 text-amber-800 border-amber-200',
  needs_repair: 'bg-red-100 text-red-800 border-red-200',
}

// ── Helpers ─────────────────────────────────────────────────────────
function parseImages(imagesStr: string): string[] {
  try {
    const parsed = JSON.parse(imagesStr)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground mr-1">
        ({count})
      </span>
    </div>
  )
}

// ── Route definition ────────────────────────────────────────────────
export const Route = createFileRoute('/products/$id')({
  head: ({ params }) => ({
    meta: [
      { title: `تفاصيل المنتج - سوق قطع الغيار العراقي` },
      {
        name: 'description',
        content: 'تفاصيل المنتج الكاملة مع الصور والسعر ومعلومات البائع في سوق قطع الغيار العراقي',
      },
    ],
  }),
  component: ProductDetailPage,
})

// ── Page component ──────────────────────────────────────────────────
function ProductDetailPage() {
  const { id } = useParams({ from: '/products/$id' })
  const navigate = useNavigate()
  const { product, seller, isLoading, error } = useProductDetail(id)
  const { isAuthenticated } = useAuth()
  const { addToCart, isAdding } = useCart()

  const [activeImage, setActiveImage] = useState(0)
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({})

  const images = product ? parseImages(product.images) : []
  const hasImages = images.length > 0

  const handleAddToCart = async () => {
    if (!product) return
    try {
      await addToCart({ productId: product.id, quantity: 1 })
      toast.success('تمت إضافة المنتج إلى السلة', {
        description: `تمت إضافة "${product.name}" إلى سلة التسوق`,
      })
    } catch (err: any) {
      toast.error('فشلت الإضافة إلى السلة', {
        description: err?.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
      })
    }
  }

  const handleImgError = (idx: number) => {
    setImgErrors((prev) => ({ ...prev, [idx]: true }))
  }

  // ── Loading state ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-32 rounded" />
          </div>

          {/* Desktop two-column layout skeleton */}
          <div className="lg:grid lg:grid-cols-[60%_40%] lg:gap-8">
            {/* Image gallery skeleton */}
            <div>
              <Skeleton className="w-full aspect-[4/3] rounded-xl" />
              <div className="flex gap-2 mt-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-lg shrink-0" />
                ))}
              </div>
            </div>

            {/* Product info skeleton */}
            <div className="space-y-4 mt-6 lg:mt-0">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-10 w-1/3" />
              <div className="flex gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>

          {/* Seller skeleton */}
          <Skeleton className="h-32 w-full rounded-xl mt-8" />
        </div>
      </div>
    )
  }

  // ── Error / not found state ───────────────────────────────────────
  if (error || !product) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 px-4 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            {error ? 'حدث خطأ' : 'المنتج غير موجود'}
          </h1>
          <p className="text-muted-foreground max-w-md mb-8">
            {error
              ? 'حدث خطأ أثناء تحميل تفاصيل المنتج. يرجى المحاولة مرة أخرى.'
              : 'المنتج الذي تبحث عنه غير متوفر أو تم حذفه.'}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </Button>
            <Button onClick={() => navigate({ to: '/' })}>
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة للرئيسية
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Derived values ────────────────────────────────────────────────
  const conditionLabel = CONDITION_LABELS[product.condition] || product.condition
  const conditionStyle =
    CONDITION_STYLES[product.condition] || 'bg-gray-100 text-gray-800 border-gray-200'
  const isNegotiable = product.negotiable === 'true'
  const isOriginal = product.isOriginal === 'original'

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* ═══════════════ HEADER / BREADCRUMB ═══════════════ */}
      <div className="bg-card border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-accent transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
              الرئيسية
            </Link>
            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <main className="flex-1 mx-auto max-w-6xl px-4 py-6 w-full">
        {/* Desktop: two-column layout | Mobile: stacked */}
        <div className="lg:grid lg:grid-cols-[60%_40%] lg:gap-8">
          {/* ── LEFT: Image Gallery ────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Main image */}
            <div className="relative bg-gradient-to-br from-muted/50 to-secondary/50 rounded-xl border border-border overflow-hidden aspect-[4/3] flex items-center justify-center">
              {hasImages && !imgErrors[activeImage] ? (
                <img
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-2"
                  onError={() => handleImgError(activeImage)}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground/40">
                  <PackageOpen className="h-24 w-24" />
                  <span className="text-sm">لا توجد صورة</span>
                </div>
              )}

              {/* Navigation arrows for gallery */}
              {hasImages && images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImage((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1,
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-colors shadow-sm"
                    aria-label="الصورة السابقة"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImage((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-colors shadow-sm"
                    aria-label="الصورة التالية"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {hasImages && images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 h-20 rounded-lg border-2 shrink-0 overflow-hidden bg-muted/30 transition-all duration-200 ${
                      idx === activeImage
                        ? 'border-accent ring-2 ring-accent/30'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    {!imgErrors[idx] ? (
                      <img
                        src={img}
                        alt={`${product.name} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={() => handleImgError(idx)}
                      />
                    ) : (
                      <PackageOpen className="h-6 w-6 text-muted-foreground/40 absolute inset-0 m-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── RIGHT: Product Info ───────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-6 lg:mt-0"
          >
            {/* Product name */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-4">
              <span className="text-3xl md:text-4xl font-extrabold text-accent">
                {formatPrice(product.price)}
              </span>
              {isNegotiable && (
                <Badge
                  variant="secondary"
                  className="mr-3 border border-accent/30 bg-accent/10 text-accent text-xs font-medium align-middle"
                >
                  قابل للتفاوض
                </Badge>
              )}
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge
                variant="secondary"
                className={`border text-xs font-medium ${conditionStyle}`}
              >
                {conditionLabel}
              </Badge>
              <Badge
                variant="secondary"
                className={`border text-xs font-medium ${
                  isOriginal
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-purple-100 text-purple-800 border-purple-200'
                }`}
              >
                {isOriginal ? 'أصلي وكالة' : 'تجاري'}
              </Badge>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-sm">
              {/* Brand */}
              <div className="flex items-center gap-2.5 bg-muted/50 rounded-lg px-3 py-2.5">
                <Car className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs">الماركة</span>
                  <p className="font-semibold text-foreground">{product.brand}</p>
                </div>
              </div>

              {/* Model */}
              <div className="flex items-center gap-2.5 bg-muted/50 rounded-lg px-3 py-2.5">
                <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs">الموديل</span>
                  <p className="font-semibold text-foreground">{product.model}</p>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-center gap-2.5 bg-muted/50 rounded-lg px-3 py-2.5">
                <Warehouse className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs">الفئة</span>
                  <p className="font-semibold text-foreground">{product.category}</p>
                </div>
              </div>

              {/* Origin country */}
              <div className="flex items-center gap-2.5 bg-muted/50 rounded-lg px-3 py-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs">بلد المنشأ</span>
                  <p className="font-semibold text-foreground">
                    {product.originCountry}
                  </p>
                </div>
              </div>

              {/* Part number */}
              {product.partNumber && (
                <div className="flex items-center gap-2.5 bg-muted/50 rounded-lg px-3 py-2.5 sm:col-span-2">
                  <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <span className="text-muted-foreground text-xs">
                      رقم القطعة
                    </span>
                    <p className="font-semibold text-foreground font-mono text-xs tracking-wide">
                      {product.partNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{product.views} مشاهدة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4" />
                <span
                  className={
                    product.quantity > 0
                      ? 'text-emerald-600 font-medium'
                      : 'text-destructive font-medium'
                  }
                >
                  {product.quantity > 0
                    ? `${product.quantity} قطعة متوفرة`
                    : 'نفذت الكمية'}
                </span>
              </div>
            </div>

            {/* Seller card (mobile: shown here; desktop: shown in sidebar) */}
            {seller && (
              <div className="lg:hidden">
                <SellerCard seller={seller} />
              </div>
            )}
          </motion.div>
        </div>

        {/* ═══════════ DESCRIPTION SECTION ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">
            وصف المنتج
          </h2>
          <Card className="p-6 border border-border">
            <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </Card>
        </motion.div>

        {/* ═══════════ SELLER CARD (desktop) ═══════════ */}
        {seller && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 hidden lg:block"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">
              معلومات البائع
            </h2>
            <SellerCard seller={seller} />
          </motion.div>
        )}
      </main>

      {/* ═══════════════ STICKY BOTTOM ACTION BAR ═══════════════ */}
      <div className="sticky bottom-0 z-40 bg-card border-t border-border shadow-lg">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
          {/* Price + quantity — hidden on smallest screens */}
          <div className="hidden sm:flex items-center gap-3 flex-1">
            <span className="text-xl font-bold text-accent">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-muted-foreground">
              {product.quantity > 0
                ? `${product.quantity} قطعة متوفرة`
                : 'نفذت الكمية'}
            </span>
          </div>

          <div className="flex-1 sm:flex-none sm:w-auto">
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  يجب{' '}
                  <Link
                    to="/auth"
                    className="text-accent hover:underline font-medium"
                  >
                    تسجيل الدخول
                  </Link>{' '}
                  لإضافة المنتج إلى السلة
                </p>
              </div>
            ) : (
              <Button
                size="lg"
                disabled={product.quantity <= 0 || isAdding}
                onClick={handleAddToCart}
                className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-base px-8 gap-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isAdding ? (
                  <div className="h-5 w-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
                {isAdding ? 'جارٍ الإضافة...' : 'أضف إلى السلة'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Seller sub-component ─────────────────────────────────────────────
function SellerCard({ seller }: { seller: { id: string; fullName: string; phone: string; governorate: string; rating: number; ratingCount: number; avatarUrl?: string } }) {
  const firstLetter = seller.fullName?.charAt(0) || 'ب'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-5 border border-border">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            {seller.avatarUrl ? (
              <img
                src={seller.avatarUrl}
                alt={seller.fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-primary-foreground">
                {firstLetter}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground">
              {seller.fullName}
            </h3>
            <StarRating rating={seller.rating} count={seller.ratingCount} />
          </div>

          {/* Contact info */}
          <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground shrink-0">
            {seller.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                <span dir="ltr">{seller.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{seller.governorate}</span>
            </div>
          </div>
        </div>

        {/* Mobile contact info */}
        <div className="sm:hidden mt-3 pt-3 border-t border-border flex flex-col gap-2 text-sm text-muted-foreground">
          {seller.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-4 w-4" />
              <span dir="ltr">{seller.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>{seller.governorate}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
