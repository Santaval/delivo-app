import { toast } from "@/context/ToastContext";
import i18n from "@/i18n";
import ProductsService from "@/services/products/Products.service";
import { useCallback, useMemo, useRef, useState } from "react";
import useFocusRefetch from "./useFocusRefetch";

const useProducts = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const fetchProducts = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!silent) {
      if (hasLoadedRef.current) setIsRefreshing(true);
      else setIsInitialLoading(true);
    }

    try {
      const response = await ProductsService.all();
      setAllProducts(response);
      setError(null);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(i18n.t('loadFailedError'));
      // Mantiene los datos viejos visibles pero avisa que la recarga falló
      if (hasLoadedRef.current) toast.error(i18n.t('loadFailedError'));
    } finally {
      isFetchingRef.current = false;
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Recarga al volver a la pantalla (ej. después de crear un producto)
  useFocusRefetch((isFirstFocus) => {
    fetchProducts({ silent: !isFirstFocus });
  });

  const products = useMemo(() => {
    if (!query) return allProducts;

    return allProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [allProducts, query]);

  return {
    products,
    loading: isInitialLoading || isRefreshing,
    isInitialLoading,
    isRefreshing,
    error,
    searchProducts: setQuery,
    refresh: fetchProducts,
  };
};

export default useProducts;
