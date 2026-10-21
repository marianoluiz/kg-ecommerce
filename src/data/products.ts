export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  alt: string;
  quadros?: boolean;
};

export const products: Product[] = [
  { id: "acid-knit-polo", name: "Acid Knit Polo", price: 1499, image: "/images/products/acid-knit-polo.avif", alt: "Model in neon knit polo", quadros: true },
  { id: "burgundy-v-neck-layer", name: "Burgundy V-Neck Layer", price: 1299, image: "/images/products/burgundy-v-neck-layer.avif", alt: "Model in burgundy v-neck layer" },
  { id: "emerald-utility-coat", name: "Emerald Utility Coat", price: 1499, image: "/images/products/emerald-utility-coat.avif", alt: "Model in emerald green utility coat" },
  { id: "camel-v-neck-knit", name: "Camel V-Neck Knit", price: 1199, image: "/images/products/camel-v-neck-knit.avif", alt: "Model in camel v-neck knit" },
  { id: "azure-utility-jacket", name: "Azure Utility Jacket", price: 1399, image: "/images/products/azure-utility-jacket.avif", alt: "Model in azure blue utility jacket" },
  { id: "navy-utility-overcoat", name: "Navy Utility Overcoat", price: 1499, image: "/images/products/navy-utility-overcoat.webp", alt: "Model in navy utility overcoat" },
  { id: "azure-contrast-knit", name: "Azure Contrast Knit", price: 1199, image: "/images/products/azure-contrast-knit.avif", alt: "Model in azure contrast knit" },
  { id: "obsidian-technical-blazer", name: "Obsidian Technical Blazer", price: 1499, image: "/images/products/obsidian-technical-blazer.avif", alt: "Model in black technical blazer" },
];
