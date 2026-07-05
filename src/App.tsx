import NavBar from "./components/NavBar";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          مرحباً بك في متجر قطع غيار السيارات
        </h1>
      </main>
    </div>
  );
}

export default App;