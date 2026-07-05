export default function SearchPanel() {
  return (
    <section className="relative -mt-24 z-20 px-6">

      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-8">

        <div className="grid lg:grid-cols-5 gap-5">

          <input
            className="h-14 rounded-xl border border-gray-300 px-5 outline-none focus:border-red-500"
            placeholder="ابحث عن قطعة غيار..."
          />

          <select className="h-14 rounded-xl border border-gray-300 px-4">
            <option>الشركة</option>
            <option>Toyota</option>
            <option>Hyundai</option>
            <option>Kia</option>
            <option>Nissan</option>
            <option>BMW</option>
            <option>Mercedes</option>
          </select>

          <select className="h-14 rounded-xl border border-gray-300 px-4">
            <option>الموديل</option>
            {Array.from({ length: 37 }, (_, i) => (
              <option key={i}>{1990 + i}</option>
            ))}
          </select>

          <select className="h-14 rounded-xl border border-gray-300 px-4">
            <option>المحافظة</option>
            <option>بغداد</option>
            <option>البصرة</option>
            <option>نينوى</option>
            <option>أربيل</option>
            <option>النجف</option>
            <option>كربلاء</option>
            <option>ديالى</option>
            <option>واسط</option>
            <option>ذي قار</option>
          </select>

          <button className="h-14 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg">
            🔍 بحث
          </button>

        </div>

        <div className="grid lg:grid-cols-4 gap-6 mt-8 text-center">

          <div>
            <div className="text-3xl">🚚</div>
            <p className="font-bold mt-2">شحن لجميع المحافظات</p>
          </div>

          <div>
            <div className="text-3xl">🛡️</div>
            <p className="font-bold mt-2">بائعون موثقون</p>
          </div>

          <div>
            <div className="text-3xl">⭐</div>
            <p className="font-bold mt-2">أفضل الأسعار</p>
          </div>

          <div>
            <div className="text-3xl">📞</div>
            <p className="font-bold mt-2">دعم فني 24/7</p>
          </div>

        </div>

      </div>

    </section>
  );
}