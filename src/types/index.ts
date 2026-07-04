// أنواع البيانات الأساسية لسوق قطع الغيار

export interface Profile {
  id: string
  userId: string
  fullName: string
  phone: string
  governorate: string
  address: string
  accountType: 'buyer' | 'seller' | 'both'
  walletNumber: string
  walletType: 'zaincash' | 'fastpay' | ''
  avatarUrl: string
  rating: number
  ratingCount: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  sellerId: string
  name: string
  brand: string
  model: string
  category: string
  price: number
  quantity: number
  description: string
  images: string
  condition: 'new' | 'excellent_used' | 'good' | 'needs_repair'
  isOriginal: 'original' | 'aftermarket'
  originCountry: string
  partNumber: string
  negotiable: string
  status: 'published' | 'draft'
  views: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  createdAt: string
}

export interface Order {
  id: string
  buyerId: string
  sellerId: string
  productId: string
  productName: string
  productPrice: number
  quantity: number
  totalPrice: number
  commission: number
  status: 'pending' | 'paid' | 'processing' | 'delivered' | 'completed' | 'cancelled'
  paymentMethod: string
  buyerPhone: string
  buyerWallet: string
  notes: string
  createdAt: string
  updatedAt: string
}

export const CAR_BRANDS = [
  'تويوتا', 'نيسان', 'هوندا', 'هيونداي', 'كيا', 'مازدا', 'سوزوكي', 'ميتسوبيشي',
  'مرسيدس', 'بي إم دبليو', 'أودي', 'فولكس واجن', 'فورد', 'شيفروليه', 'جيب',
  'لكزس', 'إنفينيتي', 'كاديلاك', 'لينكولن', 'جي إم سي', 'دودج', 'كرايسلر',
  'رينو', 'بيجو', 'فيات', 'أوبل', 'سيات', 'سوبارو', 'فولفو', 'جاغوار',
  'لاند روفر', 'بورش', 'فيراري', 'لامبورغيني', 'رولز رويس', 'بنتلي',
  'إم جي', 'جيلي', 'شانجان', 'هافال', 'تاتا', 'دايو', 'جاك', 'ألفا روميو',
  'أبريلا', 'ساب', 'بونتياك', 'ديهاتسو', 'إيسوزو', 'صني',
]

export const CATEGORIES = [
  'محركات', 'مكابس', 'فرامل', 'إطارات وعجلات', 'زيوت',
  'إلكترونيات سيارات', 'أنظمة تبريد', 'تعليق وتوجيه', 'أضواء وإشارات',
  'مرايا وأبواب', 'زجاج', 'جنوط', 'مقاعد وتنجيد', 'أجزاء داخلية',
  'قطع كهربائية', 'أدوات ولوازم صيانة', 'قطع نادرة ومستعملة', 'صالونات سيارات كاملة',
]

export const GOVERNORATES = [
  'بغداد', 'أربيل', 'البصرة', 'الموصل', 'النجف', 'كربلاء', 'دهوك', 'السليمانية',
  'تكريت', 'الرمادي', 'العمارة', 'الناصرية', 'الكوت', 'الديوانية', 'السماوة',
  'زاخو', 'كركوك', 'الحلة', 'الفلوجة', 'سامراء', 'بعقوبة', 'خانقين',
  'حلبجة', 'سنجار', 'الشطرة', 'الرفاعي', 'الزبير', 'أبو الخصيب',
]

export const CONDITION_LABELS: Record<string, string> = {
  new: 'جديد',
  excellent_used: 'مستعمل ممتاز',
  good: 'جيد',
  needs_repair: 'يحتاج صيانة',
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  paid: 'تم الدفع',
  processing: 'قيد التجهيز',
  delivered: 'تم التوصيل',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-IQ').format(price) + ' د.ع'
}
