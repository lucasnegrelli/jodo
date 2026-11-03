'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingTransition from "@/components/loadingTransition";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Tempo mínimo visível do loader

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {isLoading && <LoadingTransition />}
      {children}
    </>
  );
}