import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Button, Card } from '@blinkdotnew/ui'
import { motion } from 'framer-motion'
import {
  Car, UserCheck, Store, Shield, CreditCard, Truck, LogIn, UserPlus,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { blink } from '@/blink/client'

export const Route = createFileRoute('/auth')({
  head: () => ({
    meta: [{ title: 'تسجيل الدخول - سوق قطع الغيار العراقي' }],
  }),
  component: AuthPage,
})

const BUYER_BENEFITS = [
  { icon: Shield, title: 'شراء آمن ومضمون', desc: 'ادفع عبر زين كاش أو فاست باي بأمان تام' },
  { icon: Truck, title: 'توصيل سريع', desc: 'توصيل إلى جميع محافظات العراق' },
  { icon: CreditCard, title: 'أسعار تنافسية', desc: 'قارن الأسعار واختر الأنسب لك' },
]

const SELLER_BENEFITS = [
  { icon: Store, title: 'متجرك الخاص', desc: 'اعرض منتجاتك لآلاف المشترين في العراق' },
  { icon: CreditCard, title: 'عمولة منخفضة', desc: 'عمولة 2% فقط على كل عملية بيع ناجحة' },
  { icon: Shield, title: 'حماية كاملة', desc: 'نضمن حقوقك كبائع مع نظام تقييم موثوق' },
]

function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate({ to: '/' })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  const handleLogin = () => {
    blink.auth.login()
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="relative overflow-hidden">
        {/* Background decorative */}
        <div className="absolute inset-0 bg-primary h-[40vh]" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary to-background h-[60vh]" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-12 pb-16">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/20 mb-6">
              <Car className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              انضم إلى سوق قطع الغيار العراقي
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
              أكبر منصة لبيع وشراء قطع غيار السيارات في العراق. الآلاف من البائعين والمشترين بانتظارك.
            </p>
          </motion.div>

          {/* Auth Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto space-y-3 mb-12"
          >
            <Button
              size="lg"
              className="w-full h-14 text-lg gap-3 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25"
              onClick={handleLogin}
            >
              <LogIn className="h-5 w-5" />
              تسجيل الدخول
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full h-14 text-lg gap-3 border-2"
              onClick={handleLogin}
            >
              <UserPlus className="h-5 w-5" />
              إنشاء حساب جديد
            </Button>
            <p className="text-center text-sm text-muted-foreground pt-2">
              بالتسجيل، أنت توافق على شروط الاستخدام وسياسة الخصوصية
            </p>
          </motion.div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buyer Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 border border-border h-full">
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="h-6 w-6 text-accent" />
                  <h2 className="text-xl font-semibold text-foreground">كمشتري</h2>
                </div>
                <div className="space-y-4">
                  {BUYER_BENEFITS.map((benefit, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <benefit.icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{benefit.title}</p>
                        <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Seller Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 border border-border h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Store className="h-6 w-6 text-accent" />
                  <h2 className="text-xl font-semibold text-foreground">كبائع</h2>
                </div>
                <div className="space-y-4">
                  {SELLER_BENEFITS.map((benefit, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <benefit.icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{benefit.title}</p>
                        <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
