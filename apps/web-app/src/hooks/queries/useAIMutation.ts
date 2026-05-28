import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

type GenerateContentPayload = {
  template: string;
  prompt: string;
  freeGift: string;
};

export function useGenerateContentMutation() {
  return useMutation({
    mutationFn: async (payload: GenerateContentPayload) => {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้างคอนเทนต์");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("สร้าง Prompt สำเร็จ!");
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ AI");
    },
  });
}
