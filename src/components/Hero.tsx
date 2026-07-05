export default function Hero() {
  return (
    <section className="relative w-full h-[600px] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <img 
        src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=2070" 
        className="absolute inset-0 w-full h-full object-cover" 
        alt="سيارة"
      />
      <div className="relative z-20 text-center text-white px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">سوق قطع غيار العراق</h1>
        <p className="text-xl text-gray-200 mb-8">أكبر منصة لبيع وشراء قطع غيار السيارات في العراق</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-transform hover:scale-105">تصفح القطع الآن</button>
      </div>
    </section>
  );
}