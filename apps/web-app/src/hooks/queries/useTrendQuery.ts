import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TrendContentPlan, TrendSnapshotItem } from "../../types/planner";
import { createPostFromNews } from "../../utils/post-builder";
import toast from "react-hot-toast";

async function parseTrendResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "สร้างแผนไม่สำเร็จ");
  return body as TrendContentPlan;
}

export function useTrendQuery(initialPlan: TrendContentPlan) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["trendPlan"],
    queryFn: () => initialPlan,
    initialData: initialPlan,
    staleTime: Infinity,
  });

  const updateDataMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/update-trends", { method: "POST", cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "อัปเดตข้อมูลไม่สำเร็จ");
      return data;
    },
    onSuccess: (data) => {
      if (data.snapshot) {
        queryClient.setQueryData(["trendPlan"], (old: TrendContentPlan | undefined) => {
          if (!old) return old;
          return {
            ...old,
            trendSnapshot: data.snapshot
          };
        });
      }
      toast.success(`อัปเดตข้อมูลล่าสุดสำเร็จ (${data.count} โพสต์)`);
    },
    onError: (error) => toast.error(error.message),
  });

  const generatePlanMutation = useMutation({
    mutationFn: async () => parseTrendResponse(await fetch("/api/generate-trend-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    })),
    onSuccess: (data) => {
      queryClient.setQueryData(["trendPlan"], data);
      toast.success("สร้างแผนเทรนด์ 7 วันสำเร็จ");
    },
    onError: (error) => toast.error(error.message),
  });

  const addNewsToPlan = (newsItem: TrendSnapshotItem) => {
    queryClient.setQueryData(["trendPlan"], (old: TrendContentPlan | undefined) => {
      if (!old) return old;
      const newPost = createPostFromNews(newsItem, old.weeklyPosts.length);
      return {
        ...old,
        weeklyPosts: [...old.weeklyPosts, newPost]
      };
    });
    toast.success("เพิ่มข่าวลงปฏิทินสำเร็จ");
  };

  return {
    plan: query.data,
    updateDataMutation,
    generatePlanMutation,
    addNewsToPlan,
  };
}
