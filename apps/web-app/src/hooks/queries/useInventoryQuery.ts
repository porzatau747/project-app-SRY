import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PlannerState } from "../../types/planner";
import toast from "react-hot-toast";

async function parseResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "ทำรายการไม่สำเร็จ");
  return body as PlannerState;
}

export function useInventoryQuery(initialState: PlannerState) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["plannerState"],
    queryFn: () => initialState, // Fallback if no data, though we seed with initialData
    initialData: initialState,
    staleTime: Infinity,
  });

  const onSuccess = (data: PlannerState, message: string) => {
    queryClient.setQueryData(["plannerState"], data);
    toast.success(message);
  };

  const onError = (error: Error) => {
    toast.error(error.message);
  };

  const syncStockMutation = useMutation({
    mutationFn: async () => {
      return parseResponse(await fetch("/api/sync-stock", { method: "POST" }));
    },
    onSuccess: (data) => onSuccess(data, "ซิงค์ข้อมูลสต็อกและราคากลางสำเร็จ"),
    onError,
  });

  return {
    state: query.data,
    syncStockMutation,
  };
}
