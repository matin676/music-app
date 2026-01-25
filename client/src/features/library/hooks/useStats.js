import { useQuery } from "@tanstack/react-query";
import { getStats } from "../../../api";

export const useStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchOnWindowFocus: false,
  });
};
