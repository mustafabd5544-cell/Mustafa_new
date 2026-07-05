import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useProducts() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) setProducts(data || [])
    }

    fetchProducts()
  }, [])

  return products
}