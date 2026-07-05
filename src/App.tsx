import NavBar from "./components/NavBar";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-['Tajawal']">
      <NavBar />
      
      {/* قسم الترحيب */}
      <header className="bg-blue-900 text-white py-16 text-center">
        <h1 className="text-4xl font-black mb-4">متجر قطع غيار السيارات - الجودة والاحترافية</h1>
        <p className="text-blue-100 text-lg">أفضل القطع الأصلية لسيارتك بأفضل الأسعار</p>
      </header>

      {/* قسم المنتجات */}
      <main className="p-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 border-r-4 border-blue-900 pr-4">أحدث القطع المضافة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100">
              <div className="h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">صورة القطعة</div>
              <h3 className="font-bold text-xl">قطعة غيار رقم {item}</h3>
              <p className="text-gray-600 mt-2">وصف قصير للقطعة ومميزاتها التقنية.</p>
              <button className="mt-4 w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition-colors">
                عرض التفاصيل
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;