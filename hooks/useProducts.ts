import ProductsService from "@/services/products/Products.service";
import { useEffect, useState } from "react";

const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductsService.all();
      setProducts(response);
      setOriginalProducts(response);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = (query: string) => {
    if (!query) {
      setProducts(originalProducts);
      return;
    }

    const filtered = originalProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    setProducts(filtered);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, searchProducts };
};

export default useProducts;