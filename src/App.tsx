import NavBar from "./components/NavBar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";

export default function App() {
  return (
    <main className="min-h-screen">
      <NavBar />
      <Hero />
      <Categories />
    </main>
  );
}