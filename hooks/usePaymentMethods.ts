import PaymentMethodsService from "@/services/paymentMethods/PaymentMethods.service";
import { useEffect, useState } from "react";

const usePaymentMethods = () => {
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoading(true);
      try {
        const methods = await PaymentMethodsService.all();
        setPaymentMethods(methods);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const refreshPaymentMethods = async () => {
    setLoading(true);
    try {
      const methods = await PaymentMethodsService.all();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPaymentMethod = async (body: any) => {
    setLoading(true);
    try {
      const method = await PaymentMethodsService.create(body);
      setPaymentMethods((prev) => [...prev, method]);
    } catch (error) {
      console.error('Error creating payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, paymentMethods, error, refreshPaymentMethods, createPaymentMethod };
};

export default usePaymentMethods;
