import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Button, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@blinkdotnew/ui'
import { motion } from 'framer-motion'
import { Search, PackageOpen, Car, Tag, MapPin, Filter, ArrowUpDown } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { CAR_BRANDS, CATEGORIES, GOVERNORATES, CONDITION_LABELS } from '@/types'
import type { ProductFilters } from '@/hooks/useProducts'
import { Navbar } from '@/components/Navbar'
import { ProductCard, SkeletonCard } from '@/components/ProductCard'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'سوق قطع الغيار العراقي - وجهتك الأولى لقطع غيار السيارات' },
      { name: 'description', content: 'منصة إلكترونية عراقية لبيع وشراء قطع غيار السيارات في جميع محافظات العراق' },
    ],
  }),
  component: HomePage,
})

type SortOption = 'newest' | 'cheapest' | 'most_expensive'

// ── Select helpers to reduce JSX verbosity ──────────────────────────
const brandItems = CAR_BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)
const catItems = CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)
const condItems = Object.entries(CONDITION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)
const govItems = GOVERNORATES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)

function HomePage() {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedGovernorate, setSelectedGovernorate] = useState('all')
  const [selectedCondition, setSelectedCondition] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const filters: ProductFilters = useMemo(() => {
    const f: ProductFilters = {}
    if (selectedBrand !== 'all') f.brand = selectedBrand
    if (selectedCategory !== 'all') f.category = selectedCategory
    if (selectedCondition !== 'all') f.condition = selectedCondition
    if (selectedGovernorate !== 'all') f.governorate = selectedGovernorate
    if (searchTerm.trim()) f.search = searchTerm.trim()
    return f
  }, [searchTerm, selectedBrand, selectedCategory, selectedCondition, selectedGovernorate])

  const { data: products, isLoading } = useProducts(filters)
  const { totalItems: cartCount } = useCart()

  const sortedProducts = useMemo(() => {
    if (!products) return []
    const sorted = [...products]
    if (sortBy === 'cheapest') sorted.sort((a, b) => a.price - b.price)
    else if (sortBy === 'most_expensive') sorted.sort((a, b) => b.price - a.price)
    else sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return sorted
  }, [products, sortBy])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedBrand('all')
    setSelectedCategory('all')
    setSelectedCondition('all')
    setSelectedGovernorate('all')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <Navbar cartCount={cartCount} searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="bg-primary py-10 md:py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-3xl px-4">
          <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground leading-tight">سوق قطع الغيار العراقي</h1>
          <p className="mt-3 text-primary-foreground/70 text-base md:text-lg max-w-xl mx-auto">
            وجهتك الأولى لشراء وبيع قطع غيار السيارات في العراق. تصفح آلاف القطع من بائعين موثوقين في جميع المحافظات.
          </p>
        </motion.div>
      </section>

      {/* ═══════════════ FILTER BAR ═══════════════ */}
      <section className="bg-card border-b border-border sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-3">
          {/* Desktop filters */}
          <div className="hidden md:flex items-center gap-3 flex-wrap">
            <FilterSelect value={selectedBrand} onChange={setSelectedBrand} icon={<Car className="h-3.5 w-3.5 ml-1.5" />} placeholder="الماركة">{brandItems}</FilterSelect>
            <FilterSelect value={selectedCategory} onChange={setSelectedCategory} icon={<Tag className="h-3.5 w-3.5 ml-1.5" />} placeholder="الفئة">{catItems}</FilterSelect>
            <FilterSelect value={selectedCondition} onChange={setSelectedCondition} icon={<Filter className="h-3.5 w-3.5 ml-1.5" />} placeholder="الحالة">{condItems}</FilterSelect>
            <FilterSelect value={selectedGovernorate} onChange={setSelectedGovernorate} icon={<MapPin className="h-3.5 w-3.5 ml-1.5" />} placeholder="المحافظة">{govItems}</FilterSelect>
            <div className="flex-1" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[180px]"><ArrowUpDown className="h-3.5 w-3.5 ml-1.5" /><SelectValue placeholder="الترتيب" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="cheapest">الأرخص</SelectItem>
                <SelectItem value="most_expensive">الأغلى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile filter toggle + search */}
          <div className="md:hidden flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input placeholder="ابحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10" />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setMobileFilterOpen(!mobileFilterOpen)}><Filter className="h-4 w-4" /> تصفية</Button>
          </div>

          {/* Mobile expanded filters */}
          {mobileFilterOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:hidden mt-3 space-y-3 pt-3 border-t border-border">
              <FilterSelect value={selectedBrand} onChange={setSelectedBrand} placeholder="الماركة">{brandItems}</FilterSelect>
              <FilterSelect value={selectedCategory} onChange={setSelectedCategory} placeholder="الفئة">{catItems}</FilterSelect>
              <div className="flex gap-2">
                <FilterSelect value={selectedCondition} onChange={setSelectedCondition} placeholder="الحالة" className="flex-1">{condItems}</FilterSelect>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="الترتيب" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">الأحدث</SelectItem>
                    <SelectItem value="cheapest">الأرخص</SelectItem>
                    <SelectItem value="most_expensive">الأغلى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════ PRODUCT GRID ═══════════════ */}
      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 w-full">
        <p className="mb-6 text-sm text-muted-foreground">{sortedProducts.length} منتج{sortedProducts.length !== 1 && 'ات'} تم العثور عليها</p>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : sortedProducts.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <PackageOpen className="h-20 w-20 text-muted-foreground/20 mb-6" />
            <h2 className="text-xl font-semibold text-foreground mb-2">لا توجد منتجات</h2>
            <p className="text-muted-foreground max-w-md">لم نجد أي منتجات تطابق بحثك. جرب تغيير معايير البحث أو تصفح جميع المنتجات.</p>
            <Button variant="outline" className="mt-6" onClick={clearFilters}>مسح التصفية</Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
          </div>
        )}
      </main>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-primary text-primary-foreground/60 py-8 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm">
          <p>© 2025 سوق قطع الغيار العراقي. جميع الحقوق محفوظة.</p>
          <p className="mt-1">منصة عراقية لبيع وشراء قطع غيار السيارات</p>
        </div>
      </footer>
    </div>
  )
}

// Small reusable filter select wrapper
function FilterSelect({ value, onChange, icon, placeholder, className, children }: {
  value: string; onChange: (v: string) => void; icon?: React.ReactNode;
  placeholder: string; className?: string; children: React.ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        {icon}<SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">الكل</SelectItem>
        {children}
      </SelectContent>
    </Select>
  )
}
