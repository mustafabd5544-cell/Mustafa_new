import ProductCard from "./ProductCard";

const products = [
  {
    id: 1,
    name: "محرك كامري 2022",
    price: 2500,
    company: "Toyota",
    governorate: "بغداد",
    condition: "جديدة",
    year: 2022,
  },
  {
    id: 2,
    name: "قير هوندا أكورد",
    price: 1800,
    company: "Honda",
    governorate: "البصرة",
    condition: "مستعملة",
    year: 2020,
  },
  {
    id: 3,
    name: "شمعة LED",
    price: 90,
    company: "Hyundai",
    governorate: "أربيل",
    condition: "جديدة",
    year: 2024,
  },
  {
    id: 4,
    name: "بطارية أصلية",
    price: 140,
    company: "Kia",
    governorate: "النجف",
    condition: "جديدة",
    year: 2023,
  },
];

export default function ProductGrid() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-14">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h2 className="text-3xl font-black">
            أحدث الإعلانات
          </h2>

          <p className="text-gray-500 mt-2">
            أحدث قطع الغيار المضافة
          </p>
        </div>

        <button className="bg-red-600 text-white px-6 py-3 rounded-xl">
          عرض الكل
        </button>

      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">

        {products.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
          />
        ))}

      </div>

    </section>
  );
}