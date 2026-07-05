export default function Categories() {
  const items = ["محركات", "إطارات", "زيوت", "فرامل", "كهربائيات", "هيكل"];
  
  return (
    <section className="py-20 px-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">الأقسام الرئيسية</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <div key={i} className="group p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-2xl transition-all cursor-pointer text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
              📦
            </div>
            <h3 className="text-xl font-bold">{item}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}