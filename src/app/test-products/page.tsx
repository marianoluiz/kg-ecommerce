import { createClient } from "@/lib/supabase/server";

export default async function TestProductsPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("id");

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <main style={{ padding: 30 }}>
      <h1>Products from Supabase</h1>

      {products?.map((product) => (
        <div
          key={product.id}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginTop: 12,
          }}
        >
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p>Price: ₱{Number(product.price).toFixed(2)}</p>
          <p>Available stock: {product.stock}</p>
        </div>
      ))}
    </main>
  );
}
