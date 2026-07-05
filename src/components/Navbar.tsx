export default function NavBar() {
  return (
    <nav className="fixed w-full z-50 py-4 px-8 flex justify-between items-center bg-white/80 backdrop-blur-md shadow-sm">
      <div className="text-gray-600 font-medium">القائمة</div>
      <div className="text-2xl font-black text-blue-800 tracking-tight">سوق قطع غيار العراق</div>
      <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">دخول</button>
    </nav>
  );
}