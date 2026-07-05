type Props = {
  product: {
    id: number
    name: string
    price: number
    image?: string
    governorate?: string
    condition?: string
    company?: string
    year?: number
  }
}

export default function ProductCard({ product }: Props) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300">

      <div className="relative">

        <img
          src={
            product.image ||
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900"
          }
          className="w-full h-56 object-cover"
        />

        <span className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
          {product.condition || "جديدة"}
        </span>

        <button className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white shadow">
          ❤️
        </button>

      </div>

      <div className="p-5">

        <h3 className="font-bold text-xl">
          {product.name}
        </h3>

        <p className="text-red-600 text-2xl font-black mt-2">
          ${product.price}
        </p>

        <div className="mt-4 space-y-2 text-gray-600">

          <p>🚗 {product.company || "Toyota"}</p>

          <p>📅 {product.year || 2022}</p>

          <p>📍 {product.governorate || "بغداد"}</p>

        </div>

        <button className="mt-6 w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold">
          عرض التفاصيل
        </button>

      </div>

    </div>
  )
}