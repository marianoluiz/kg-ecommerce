"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { SIZES, type Size } from "@/data/products";
import { ORDER_STATUSES } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRODUCTS_TAG } from "@/lib/products";

const BUCKET = "product-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};

function readNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : NaN;
}

// Reads stock_XS … stock_XL; null if any is missing or not a whole number ≥ 0.
function readSizeStock(formData: FormData) {
  const stock = {} as Record<Size, number>;
  for (const size of SIZES) {
    const value = readNumber(formData, `stock_${size}`);
    if (!Number.isInteger(value) || value < 0) return null;
    stock[size] = value;
  }
  return stock;
}

// Empty box = no sale (null). Otherwise must be a positive number below the regular price.
function readSalePrice(formData: FormData, price: number): number | null | undefined {
  const raw = String(formData.get("sale_price") ?? "").trim();
  if (raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 && value < price ? value : undefined; // undefined = invalid
}

async function saveSizeStock(productId: number, stock: Record<Size, number>) {
  const { error } = await createAdminClient()
    .from("product_variants")
    .upsert(
      SIZES.map((size) => ({ product_id: productId, size, stock: stock[size] })),
      { onConflict: "product_id,size" }
    );
  return error?.message ?? null;
}

function done(tab: string, message: string): never {
  // expire: 0 so the shop shows admin edits on the very next load.
  if (tab === "products") revalidateTag(PRODUCTS_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  redirect(`/admin?tab=${tab}&message=${encodeURIComponent(message)}`);
}

async function uploadImage(file: File) {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new Error("Image must be PNG, JPG, WEBP or AVIF.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image must be 5 MB or smaller.");

  const admin = createAdminClient();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await admin.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw new Error(`Image upload failed: ${error.message}`);

  return admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = readNumber(formData, "price");
  const stock = readSizeStock(formData);
  const image = formData.get("image");

  if (!name || !(price > 0) || !stock) {
    done("products", "Name, a price above 0 and whole-number stock for each size are required.");
  }
  const salePrice = readSalePrice(formData, price);
  if (salePrice === undefined) done("products", "Sale price must be above 0 and lower than the regular price.");
  if (!(image instanceof File) || image.size === 0) {
    done("products", "Please choose a product image.");
  }

  let imageUrl: string;
  try {
    imageUrl = await uploadImage(image as File);
  } catch (error) {
    done("products", (error as Error).message);
  }

  const admin = createAdminClient();
  const { data: product, error } = await admin
    .from("products")
    .insert({ name, description: description || null, price, sale_price: salePrice, image_url: imageUrl, is_active: true })
    .select("id")
    .single();

  if (error || !product) done("products", `Could not add product: ${error?.message}`);

  const variantError = await saveSizeStock(product.id, stock);
  done("products", variantError ? `Added ${name}, but stock failed: ${variantError}` : `Added ${name}.`);
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();

  const id = readNumber(formData, "id");
  const price = readNumber(formData, "price");
  const stock = readSizeStock(formData);
  const isActive = formData.get("is_active") === "on";
  const description = String(formData.get("description") ?? "").trim();

  if (!Number.isInteger(id) || !(price > 0) || !stock) {
    done("products", "Price must be above 0 and stock a whole number for each size.");
  }
  const salePrice = readSalePrice(formData, price);
  if (salePrice === undefined) done("products", "Sale price must be above 0 and lower than the regular price.");

  const update: Record<string, unknown> = {
    price,
    sale_price: salePrice,
    description: description || null,
    is_active: isActive,
  };

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    try {
      update.image_url = await uploadImage(image);
    } catch (error) {
      done("products", (error as Error).message);
    }
  }

  const { error } = await createAdminClient().from("products").update(update).eq("id", id);
  if (error) done("products", `Could not save: ${error.message}`);

  const variantError = await saveSizeStock(id, stock);
  done("products", variantError ? `Could not save stock: ${variantError}` : "Product saved.");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    done("orders", "Invalid status.");
  }

  const admin = createAdminClient();

  // Cancelling a COD order gives its reserved stock back (no-op for PayPal / already cancelled).
  const { error } =
    status === "cancelled"
      ? await admin.rpc("cancel_cod_order", { p_order_id: id })
      : { error: null };
  if (error) done("orders", `Could not cancel order: ${error.message}`);

  const { error: updateError } = await admin.from("orders").update({ status }).eq("id", id);
  if (!updateError && status === "cancelled") revalidateTag(PRODUCTS_TAG, { expire: 0 });
  done("orders", updateError ? `Could not update order: ${updateError.message}` : "Order updated.");
}
