import { toast } from "@/context/ToastContext";
import i18n from "@/i18n";
import ProductsService from "@/services/products/Products.service";
import { useEffect, useState } from "react";

const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ProductsService.all();
      setProducts(response);
      setOriginalProducts(response);
    } catch (err) {
      setError(i18n.t('loadFailedError'));
      if (originalProducts.length > 0) toast.error(i18n.t('loadFailedError'));
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

  return { products, loading, error, searchProducts, refresh: fetchProducts };
};

export default useProducts;