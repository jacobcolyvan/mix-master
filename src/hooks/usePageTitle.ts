import { useEffect } from "react";

export const usePageTitle = (page?: string) => {
  useEffect(() => {
    document.title = page ? `${page} | Mix Master` : "Mix Master";

    return () => {
      document.title = "Mix Master";
    };
  }, [page]);
};
