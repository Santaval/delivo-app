import ProductsService from "@/services/products/Products.service";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const useProduct = (productId: string) => {
  const { t } = useTranslation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productData = await ProductsService.findById(productId);
      setProduct(productData);
    } catch (err) {
      setError(t("failedToLoadProduct"));
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    try {
      setLoading(true);
      await ProductsService.remove(productId);
      setProduct(null);
    } catch (err) {
      setError(t("failedToRemoveProduct"));
    } finally {
      setLoading(false);
    }
  };

  const update = async (updatedData: Partial<Product>) => {
    try {
      setLoading(true);
      const updatedProduct = await ProductsService.update(
        productId,
        updatedData,
      );
      setProduct(updatedProduct);
    } catch (err) {
      setError(t("failedToUpdateProduct"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  return { product, loading, error, refresh: fetchProduct, remove, update };
};

export default useProduct;
