import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AddProducts() {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [image_url, setImageUrl] = useState("");

  const addProduct = async () => {
    const { error } = await supabase.from("products").insert([
      {
        name,
        model,
        price,
        phone,
        image_url,
      },
    ]);

    if (error) {
      alert("خطأ في إضافة المنتج");
    } else {
      alert("تم إضافة المنتج بنجاح");
      setName("");
      setModel("");
      setPrice("");
      setPhone("");
      setImageUrl("");
    }
  };

  return (
    <div className="add-form">

      <h2>➕ إضافة منتج جديد</h2>

      <input
        placeholder="اسم القطعة"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="الموديل"
        value={model}
        onChange={(e) => setModel(e.target.value)}
      />

      <input
        placeholder="السعر"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <input
        placeholder="رقم الهاتف"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        placeholder="رابط الصورة"
        value={image_url}
        onChange={(e) => setImageUrl(e.target.value)}
      />

      <button onClick={addProduct}>
        إضافة المنتج
      </button>

    </div>
  );
}