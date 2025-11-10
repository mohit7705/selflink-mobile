import { useEffect, useState } from 'react';

import { hasAuthStoreHydrated, subscribeToAuthHydration } from '@store/authStore';

export function useAuthHydration() {
  const [hydrated, setHydrated] = useState(hasAuthStoreHydrated());

  useEffect(() => {
    if (hydrated) {
      return;
    }
    const unsubscribe = subscribeToAuthHydration?.(() => {
      setHydrated(true);
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [hydrated]);

  return hydrated;
}
