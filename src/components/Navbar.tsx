import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button, Input } from '@blinkdotnew/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingCart, User, Menu, X, Plus, Car } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface NavbarProps {
  cartCount: number
  searchTerm: string
  onSearchChange: (value: string) => void
}

export function Navbar({ cartCount, searchTerm, onSearchChange }: NavbarProps) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Car className="h-7 w-7 text-accent" />
            <span className="text-lg font-bold text-primary-foreground hidden sm:block">
              سوق قطع الغيار
            </span>
          </Link>

          {/* Search bar — desktop */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="ابحث عن قطعة غيار..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-10 w-full bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/10 relative hidden sm:flex"
                  onClick={() => navigate({ to: '/cart' })}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/10 hidden sm:flex"
                  onClick={() => navigate({ to: '/profile' })}
                >
                  <User className="h-5 w-5" />
                </Button>
                <Button
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 hidden sm:flex gap-1.5"
                  onClick={() => navigate({ to: '/add-product' })}
                >
                  <Plus className="h-4 w-4" />
                  أضف إعلاناً
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => navigate({ to: '/auth' })}
              >
                دخول / تسجيل
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-primary-foreground/10 py-3 space-y-3"
            >
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="ابحث عن قطعة غيار..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pr-10 w-full bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                />
              </div>
              <div className="flex gap-2">
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-foreground flex-1"
                      onClick={() => navigate({ to: '/cart' })}
                    >
                      <ShoppingCart className="h-4 w-4 ml-2" /> السلة
                    </Button>
                    <Button
                      size="sm"
                      className="bg-accent text-accent-foreground flex-1"
                      onClick={() => navigate({ to: '/add-product' })}
                    >
                      <Plus className="h-4 w-4 ml-1" /> أضف إعلاناً
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="bg-accent text-accent-foreground w-full"
                    onClick={() => navigate({ to: '/auth' })}
                  >
                    دخول / تسجيل
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
