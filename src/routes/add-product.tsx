import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button, Input, Card, Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
  Textarea, Checkbox, Progress, toast,
} from '@blinkdotnew/ui'
import { motion } from 'framer-motion'
import { ArrowRight, Upload, Image as ImageIcon, X, Save, Send } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { blink } from '@/blink/client'
import { CAR_BRANDS, CATEGORIES, CONDITION_LABELS } from '@/types'
import type { Product } from '@/types'

export const Route = createFileRoute('/add-product')({
  head: () => ({ meta: [{ title: 'أضف إعلاناً - سوق قطع الغيار العراقي' }] }),
  component: AddProductPage,
})

const addProductSchema = z.object({
  name: z.string().min(5, 'اسم المنتج يجب أن يكون 5 أحرف على الأقل'),
  brand: z.string().min(1, 'يرجى اختيار الماركة'),
  customBrand: z.string().optional(),
  model: z.string().min(1, 'يرجى إدخال الموديل'),
  category: z.string().min(1, 'يرجى اختيار الفئة'),
  price: z.string().min(1, 'يرجى إدخال السعر').refine((v) => !isNaN(Number(v)) && Number(v) >= 1000, 'السعر يجب أن يكون 1000 د.ع على الأقل'),
  quantity: z.string().min(1, 'يرجى إدخال الكمية').refine((v) => !isNaN(Number(v)) && Number(v) >= 1, 'الكمية يجب أن تكون 1 على الأقل'),
  description: z.string().min(20, 'الوصف يجب أن يكون 20 حرفاً على الأقل'),
  condition: z.string().min(1, 'يرجى اختيار الحالة'),
  isOriginal: z.string().min(1, 'يرجى اختيار نوع القطعة'),
  originCountry: z.string().min(1, 'يرجى إدخال بلد المنشأ'),
  partNumber: z.string().optional(),
  negotiable: z.boolean(),
})

type AddProductForm = z.infer<typeof addProductSchema>

const CONDITION_OPTIONS = Object.entries(CONDITION_LABELS).map(([value, label]) => ({ value, label }))

const productsTable = blink.db.table<Product>('products')

function AddProductPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const navigate = useNavigate()
  const [images, setImages] = useState<File[]>([])
  const [showCustomBrand, setShowCustomBrand] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, getValues } = useForm<AddProductForm>({
    resolver: zodResolver(addProductSchema),
    defaultValues: { negotiable: false, brand: '', customBrand: '', condition: '', isOriginal: '', category: '' },
  })

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
          <p className="text-muted-foreground mb-6">يجب تسجيل الدخول لإضافة إعلان جديد</p>
          <Button className="bg-accent text-accent-foreground" onClick={() => navigate({ to: '/auth' })}>تسجيل الدخول</Button>
        </Card>
      </div>
    )
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 5) { toast.error('الحد الأقصى للصور هو 5'); return }
    setImages((prev) => [...prev, ...files])
    e.target.value = ''
  }

  const removeImage = (index: number) => { setImages((prev) => prev.filter((_, i) => i !== index)) }

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return []
    setIsUploading(true)
    setUploadProgress({})

    const urls: string[] = []
    for (let i = 0; i < images.length; i++) {
      try {
        const file = images[i]
        const ext = file.name.split('.').pop()
        const path = `products/${Date.now()}_${i}.${ext}`
        const { publicUrl } = await blink.storage.upload(file, path, {
          onProgress: (percent: number) => {
            setUploadProgress((prev) => ({ ...prev, [i]: percent }))
          },
        })
        urls.push(publicUrl)
      } catch (err: any) {
        throw new Error(`فشل رفع "${images[i].name}": ${err?.message || 'خطأ غير معروف'}`)
      }
    }

    setIsUploading(false)
    return urls
  }

  const onSubmit = async (data: AddProductForm) => {
    try {
      if (!user?.id) {
        toast.error('يرجى تسجيل الدخول', { description: 'يجب تسجيل الدخول لنشر إعلان' })
        return
      }
      const imageUrls = await uploadImages()
      const brand = data.brand === 'أخرى' ? (data.customBrand || 'أخرى') : data.brand
      await productsTable.create({
        sellerId: user.id,
        name: data.name,
        brand,
        model: data.model,
        category: data.category,
        price: Number(data.price),
        quantity: Number(data.quantity),
        description: data.description,
        images: JSON.stringify(imageUrls),
        condition: data.condition as Product['condition'],
        isOriginal: data.isOriginal as Product['isOriginal'],
        originCountry: data.originCountry,
        partNumber: data.partNumber || '',
        negotiable: data.negotiable ? 'true' : 'false',
        status: 'published',
        views: 0,
      })
      toast.success('تم نشر الإعلان بنجاح', { description: 'تم إضافة منتجك إلى السوق' })
      navigate({ to: '/' })
    } catch (err: any) {
      toast.error('فشل النشر', { description: err?.message || 'حدث خطأ أثناء نشر الإعلان' })
    } finally {
      setIsUploading(false)
    }
  }

  const onSaveDraft = async () => {
    try {
      const data = getValues()
      if (!user?.id) return
      const imageUrls = await uploadImages()
      const brand = data.brand === 'أخرى' ? (data.customBrand || 'أخرى') : data.brand
      await productsTable.create({
        sellerId: user.id,
        name: data.name || 'مسودة',
        brand,
        model: data.model || '',
        category: data.category || '',
        price: Number(data.price) || 0,
        quantity: Number(data.quantity) || 1,
        description: data.description || '',
        images: JSON.stringify(imageUrls),
        condition: (data.condition as Product['condition']) || 'new',
        isOriginal: (data.isOriginal as Product['isOriginal']) || 'original',
        originCountry: data.originCountry || '',
        partNumber: data.partNumber || '',
        negotiable: data.negotiable ? 'true' : 'false',
        status: 'draft',
        views: 0,
      })
      toast('تم حفظ المسودة', { description: 'تم حفظ الإعلان كمسودة' })
      navigate({ to: '/' })
    } catch (err: any) {
      toast.error('فشل الحفظ', { description: err?.message || 'حدث خطأ أثناء حفظ المسودة' })
    } finally {
      setIsUploading(false)
    }
  }

  const busy = isSubmitting || isUploading

  return (
    <div className="min-h-dvh bg-background">
      <div className="bg-primary">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-4 text-sm">
            <ArrowRight className="h-4 w-4" /> العودة إلى الرئيسية
          </button>
          <h1 className="text-2xl font-bold text-primary-foreground">أضف إعلاناً جديداً</h1>
          <p className="text-primary-foreground/70 mt-1">املأ التفاصيل أدناه لنشر قطعة الغيار في السوق</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-5 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">معلومات المنتج الأساسية</h2>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">اسم المنتج <span className="text-destructive">*</span></label>
              <Input {...register('name')} placeholder="مثال: مكابح أمامية تويوتا كورولا 2020" className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">الماركة <span className="text-destructive">*</span></label>
                <Controller name="brand" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => { field.onChange(v); setShowCustomBrand(v === 'أخرى') }}>
                    <SelectTrigger className={errors.brand ? 'border-destructive' : ''}><SelectValue placeholder="اختر الماركة" /></SelectTrigger>
                    <SelectContent>
                      {CAR_BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
                {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">الموديل / السنة <span className="text-destructive">*</span></label>
                <Input {...register('model')} placeholder="مثال: كورولا 2020" className={errors.model ? 'border-destructive' : ''} />
                {errors.model && <p className="text-sm text-destructive">{errors.model.message}</p>}
              </div>
            </div>
            {showCustomBrand && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">اسم الماركة الأخرى</label>
                <Input {...register('customBrand')} placeholder="أدخل اسم الماركة" />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">الفئة <span className="text-destructive">*</span></label>
              <Controller name="category" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={errors.category ? 'border-destructive' : ''}><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">السعر والكمية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">السعر (دينار عراقي) <span className="text-destructive">*</span></label>
                <Input {...register('price')} type="number" min="1000" placeholder="مثال: 85000" className={errors.price ? 'border-destructive' : ''} />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">الكمية المتوفرة <span className="text-destructive">*</span></label>
                <Input {...register('quantity')} type="number" min="1" placeholder="مثال: 5" className={errors.quantity ? 'border-destructive' : ''} />
                {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Controller name="negotiable" control={control} render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} id="negotiable" />
              )} />
              <label htmlFor="negotiable" className="text-sm text-foreground cursor-pointer">السعر قابل للتفاوض</label>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">حالة القطعة ونوعها</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">الحالة <span className="text-destructive">*</span></label>
                <Controller name="condition" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.condition ? 'border-destructive' : ''}><SelectValue placeholder="اختر الحالة" /></SelectTrigger>
                    <SelectContent>{CONDITION_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.condition && <p className="text-sm text-destructive">{errors.condition.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">نوع القطعة <span className="text-destructive">*</span></label>
                <Controller name="isOriginal" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.isOriginal ? 'border-destructive' : ''}><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">أصلي (وكالة)</SelectItem>
                      <SelectItem value="aftermarket">تجاري (بديل)</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
                {errors.isOriginal && <p className="text-sm text-destructive">{errors.isOriginal.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">بلد المنشأ <span className="text-destructive">*</span></label>
                <Input {...register('originCountry')} placeholder="مثال: اليابان" className={errors.originCountry ? 'border-destructive' : ''} />
                {errors.originCountry && <p className="text-sm text-destructive">{errors.originCountry.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">رقم القطعة</label>
                <Input {...register('partNumber')} placeholder="مثال: TC-2020-FB" />
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">الوصف</h2>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">وصف المنتج <span className="text-destructive">*</span></label>
              <Textarea {...register('description')} placeholder="اكتب وصفاً تفصيلياً للمنتج... (20 حرف على الأقل)" rows={5} className={errors.description ? 'border-destructive' : ''} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">الصور</h2>
            <p className="text-sm text-muted-foreground">يمكنك رفع 1-5 صور للمنتج</p>
            <div className="flex flex-wrap gap-3">
              {images.map((file, index) => (
                <div key={index} className="relative w-24 h-24 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden group">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={isUploading}
                    className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:opacity-0"
                  >
                    <X className="h-5 w-5 text-primary-foreground" />
                  </button>
                  <span className="absolute bottom-0 inset-x-0 bg-foreground/70 text-primary-foreground text-[10px] text-center py-0.5 truncate px-1">{file.name}</span>
                  {isUploading && (
                    <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center gap-1 p-1.5">
                      <span className="text-[10px] font-semibold text-foreground">{uploadProgress[index] ?? 0}%</span>
                      <Progress value={uploadProgress[index] ?? 0} className="h-1 w-full" />
                    </div>
                  )}
                </div>
              ))}
              {images.length < 5 && (
                <label className={`w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-accent/50 transition-colors flex flex-col items-center justify-center gap-1 ${isUploading ? 'cursor-not-allowed opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">رفع صورة</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              )}
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-end sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-xl border border-border shadow-lg">
            <Button type="button" variant="outline" size="lg" onClick={onSaveDraft} disabled={busy} className="gap-2">
              {isUploading ? <span className="animate-spin h-4 w-4 border-2 border-foreground border-t-transparent rounded-full" /> : <Save className="h-4 w-4" />}
              حفظ كمسودة
            </Button>
            <Button type="submit" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2" disabled={busy}>
              {busy ? <span className="animate-spin h-4 w-4 border-2 border-accent-foreground border-t-transparent rounded-full" /> : <Send className="h-4 w-4" />}
              نشر الإعلان
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
