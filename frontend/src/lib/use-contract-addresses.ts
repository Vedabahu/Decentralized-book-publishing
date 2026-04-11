import { useEffect, useState } from "react";
import { loadContractAddresses, ContractAddresses } from "./abi-loader";

/**
 * Hook to load contract addresses dynamically from shared folder or env variables
 * Caches the result to avoid repeated fetches
 */
export function useContractAddresses() {
  const [addresses, setAddresses] = useState<ContractAddresses | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    loadContractAddresses()
      .then((addr) => {
        if (isMounted) {
          setAddresses(addr);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { addresses, loading, error };
}
