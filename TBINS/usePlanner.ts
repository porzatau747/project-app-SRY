import { useState, useEffect, useMemo, FormEvent } from "react";
import type { PlannerState, PostType } from "../types/planner";
import { postTypeLabels, thaiDay } from "../utils/plannerUtils";

type ActionState = {
  loading: boolean;
  message: string;
  error: string;
};

const emptyAction: ActionState = { loading: false, message: "", error: "" };
const dayMap: Record<string, string> = {
  Monday: "วันจันทร์",
  Tuesday: "วันอังคาร",
  Wednesday: "วันพุธ",
  Thursday: "วันพฤหัสบดี",
  Friday: "วันศุกร์",
  Saturday: "วันเสาร์",
  Sunday: "วันอาทิตย์"
};
const reverseDayMap = Object.fromEntries(Object.entries(dayMap).map(([english, thai]) => [thai, english]));
const postTypes: PostType[] = ["Sales", "Meme", "Knowledge", "Engagement", "News"];

async function parseResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "ทำรายการไม่สำเร็จ");
  return body as PlannerState;
}

function minutesFromTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function todayName() {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
}

export function usePlanner(initialState: PlannerState) {
  const [state, setState] = useState(initialState);
  const [action, setAction] = useState<ActionState>(emptyAction);
  const [stockFile, setStockFile] = useState<File | null>(null);
  const [priceFile, setPriceFile] = useState<File | null>(null);
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());
  const [dndReady, setDndReady] = useState(false);

  const progress = useMemo(() => {
    if (state.weeklyPlan.some((post) => post.status === "generated")) return 4;
    if (state.weeklyPlan.some((post) => post.status === "approved")) return 3;
    if (state.weeklyPlan.length) return 2;
    return state.inventory.length ? 1 : 0;
  }, [state]);

  const contentBalance = useMemo(() => {
    return postTypes.map((type) => ({
      type,
      count: state.weeklyPlan.filter((post) => post.postType === type).length
    }));
  }, [state.weeklyPlan]);

  const trendRadar = state.analysis?.trendSnapshot ?? state.lastTrendSnapshot;

  useEffect(() => {
    setDndReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = new Date();
      const currentDay = todayName();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const dateKey = now.toISOString().slice(0, 10);

      for (const post of state.weeklyPlan) {
        const reminderKey = `${dateKey}-${post.id}`;
        const due = post.day === currentDay && currentMinutes >= minutesFromTime(post.reminderAt);
        if (!due || post.status === "generated" || remindedIds.has(reminderKey)) continue;

        setRemindedIds((current) => new Set(current).add(reminderKey));
        setAction({
          loading: false,
          message: `แจ้งเตือน: ${thaiDay(post.day)} ${post.reminderAt} - ${post.hook}`,
          error: ""
        });

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("ถึงเวลาโพสต์คอนเทนต์", {
            body: `${thaiDay(post.day)} ${post.reminderAt}: ${post.hook}`
          });
        }
      }
    }, 30000);

    return () => window.clearInterval(timer);
  }, [remindedIds, state.weeklyPlan]);

  async function runAction(label: string, callback: () => Promise<PlannerState>) {
    setAction({ loading: true, message: label, error: "" });
    try {
      const nextState = await callback();
      setState(nextState);
      setAction({ loading: false, message: `${label} สำเร็จ`, error: "" });
      import("react-hot-toast").then(({ toast }) => toast.success(`${label} สำเร็จ`));
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
      setAction({ loading: false, message: "", error: errMsg });
      import("react-hot-toast").then(({ toast }) => toast.error(errMsg));
    }
  }

  async function uploadStock(event: FormEvent) {
    event.preventDefault();
    if (!stockFile || !priceFile) {
      setAction({ loading: false, message: "", error: "กรุณาเลือกไฟล์สต็อกและไฟล์ราคากลาง" });
      return;
    }

    await runAction("อัปโหลดสต็อก", async () => {
      const formData = new FormData();
      formData.append("stockFile", stockFile);
      formData.append("priceFile", priceFile);
      return parseResponse(await fetch("/api/upload-stock", { method: "POST", body: formData }));
    });
  }



  async function generatePlan() {
    await runAction("สร้างตารางโพสต์รายสัปดาห์", async () =>
      parseResponse(await fetch("/api/generate-weekly-plan", { method: "POST" }))
    );
  }

  async function removePost(postId: string) {
    await runAction("ลบโพสต์", async () =>
      parseResponse(
        await fetch("/api/delete-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId })
        })
      )
    );
  }

  async function generateAsset(postId: string) {
    await runAction("สร้างแคปชันและพรอมป์ภาพ", async () =>
      parseResponse(
        await fetch("/api/generate-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId })
        })
      )
    );
  }

  async function movePost(postId: string, targetDay: string) {
    await runAction("ย้ายวันโพสต์", async () =>
      parseResponse(
        await fetch("/api/move-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, targetDay: reverseDayMap[targetDay] ?? targetDay })
        })
      )
    );
  }

  async function addPost(itemCode: string) {
    await runAction("เพิ่มไอเทมลงตาราง", async () =>
      parseResponse(
        await fetch("/api/add-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemCode })
        })
      )
    );
  }

  async function approvePost(postId: string, comment: string) {
    await runAction("อนุมัติคอนเทนต์", async () =>
      parseResponse(
        await fetch("/api/approve-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, comment })
        })
      )
    );
  }

  async function refreshNotification() {
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
  }

  return {
    state,
    action,
    stockFile,
    setStockFile,
    priceFile,
    setPriceFile,
    dndReady,
    progress,
    contentBalance,
    trendRadar,
    uploadStock,
    generatePlan,
    removePost,
    generateAsset,
    movePost,
    addPost,
    approvePost,
    refreshNotification
  };
}
