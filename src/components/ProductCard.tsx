import { useNavigate } from '@tanstack/react-router'
import { Card, Badge, Skeleton } from '@blinkdotnew/ui'
import { motion } from 'framer-motion'
import { PackageOpen, Car, MapPin } from 'lucide-react'
import { CONDITION_LABELS, formatPrice } from '@/types'
import type { Product } from '@/types'
import { useState } from 'react'

const CONDITION_STYLES: Record<string, string> = {
  new: 'bg-green-100 text-green-800 border-green-200',
  excellent_used: 'bg-blue-100 text-blue-800 border-blue-200',
  good: 'bg-amber-100 text-amber-800 border-amber-200',
  needs_repair: 'bg-red-100 text-red-800 border-red-200',
}

function parseImages(imagesStr: string): string[] {
  try {
    const parsed = JSON.parse(imagesStr)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden border border-border">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </Card>
  )
}

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const navigate = useNavigate()
  const conditionStyle = CONDITION_STYLES[product.condition] || 'bg-gray-100 text-gray-800'
  const negotiated = product.negotiable === 'true'
  const images = parseImages(product.images)
  const [imgError, setImgError] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
    >
      <Card
        className="group cursor-pointer overflow-hidden border border-border transition-shadow duration-300 hover:shadow-lg"
        onClick={() => navigate({ to: '/products/$id', params: { id: product.id } })}
      >
        <div className="relative h-48 bg-gradient-to-br from-muted to-secondary flex items-center justify-center overflow-hidden">
          {images.length > 0 && !imgError ? (
            <img
              src={images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <PackageOpen className="h-16 w-16 text-muted-foreground/30 transition-transform duration-300 group-hover:scale-110" />
          )}
          <Badge
            variant="secondary"
            className={`absolute top-3 left-3 border text-xs font-medium ${conditionStyle}`}
          >
            {CONDITION_LABELS[product.condition]}
          </Badge>
          {negotiated && (
            <Badge
              variant="secondary"
              className="absolute top-3 right-3 border border-accent/40 bg-accent/10 text-accent text-xs font-medium"
            >
              قابل للتفاوض
            </Badge>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-2 text-base leading-snug group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Car className="h-3.5 w-3.5" />
            <span>{product.brand}</span>
            {product.model && (
              <>
                <span className="text-border">•</span>
                <span>{product.model}</span>
              </>
            )}
            {product.originCountry && (
              <>
                <span className="text-border">•</span>
                <MapPin className="h-3.5 w-3.5" />
                <span>{product.originCountry}</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xl font-bold text-accent">{formatPrice(product.price)}</span>
            <span className="text-xs text-muted-foreground">{product.views} مشاهدة</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
