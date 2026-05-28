import React from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import type { WeeklyPlanPost } from "../../types/planner";
import { postTypeLabels, thaiDay, statusLabel, priorityLabel } from "../../utils/plannerUtils";

const days = ["วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์", "วันอาทิตย์"];

export function CalendarBoard({
  posts,
  loading,
  onRemove,
  onGenerate
}: {
  posts: WeeklyPlanPost[];
  loading: boolean;
  onRemove: (postId: string) => void;
  onGenerate: (postId: string) => void;
}) {
  if (!posts.length) return <p className="emptyText">ยังไม่มีตาราง กด "สร้างตาราง 7 วัน" หลังวิเคราะห์สต็อกแล้ว</p>;
  return (
    <div className="calendarGrid">
      {days.map((day) => (
        <CalendarDay
          day={day}
          key={day}
          loading={loading}
          posts={posts.filter((post) => thaiDay(post.day) === day)}
          onRemove={onRemove}
          onGenerate={onGenerate}
        />
      ))}
    </div>
  );
}

export function StaticCalendarBoard({
  posts,
  loading,
  onRemove,
  onGenerate
}: {
  posts: WeeklyPlanPost[];
  loading: boolean;
  onRemove: (postId: string) => void;
  onGenerate: (postId: string) => void;
}) {
  if (!posts.length) return <p className="emptyText">ยังไม่มีตาราง กด "สร้างตาราง 7 วัน" หลังวิเคราะห์สต็อกแล้ว</p>;
  return (
    <div className="calendarGrid">
      {days.map((day) => (
        <section className="calendarDay" key={day}>
          <div className="dayHeader">
            <h3>{day}</h3>
            <span>{posts.filter((post) => thaiDay(post.day) === day).length} โพสต์</span>
          </div>
          <div className="dayPosts">
            {posts
              .filter((p) => thaiDay(p.day) === day)
              .map((post) => (
                <StaticPostCard post={post} key={post.id} loading={loading} onRemove={onRemove} onGenerate={onGenerate} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function CalendarDay({
  day,
  posts,
  loading,
  onRemove,
  onGenerate
}: {
  day: string;
  posts: WeeklyPlanPost[];
  loading: boolean;
  onRemove: (postId: string) => void;
  onGenerate: (postId: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: day });
  return (
    <section className={isOver ? "calendarDay overDay" : "calendarDay"} ref={setNodeRef}>
      <div className="dayHeader">
        <h3>{day}</h3>
        <span>{posts.length} โพสต์</span>
      </div>
      <div className="dayPosts">
        {posts.map((post) => (
          <DraggablePostCard post={post} key={post.id} loading={loading} onRemove={onRemove} onGenerate={onGenerate} />
        ))}
      </div>
    </section>
  );
}

function DraggablePostCard({
  post,
  loading,
  onRemove,
  onGenerate
}: {
  post: WeeklyPlanPost;
  loading: boolean;
  onRemove: (postId: string) => void;
  onGenerate: (postId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: post.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <PostCardShell
      post={post}
      loading={loading}
      onRemove={onRemove}
      onGenerate={onGenerate}
      dragButton={<button className="dragHandle" type="button" {...listeners} {...attributes} aria-label="ลากเพื่อย้ายวัน">ลากเพื่อย้ายวัน</button>}
      className={isDragging ? "planCard draggingCard" : "planCard"}
      refCallback={setNodeRef}
      style={style}
    />
  );
}

function StaticPostCard({
  post,
  loading,
  onRemove,
  onGenerate
}: {
  post: WeeklyPlanPost;
  loading: boolean;
  onRemove: (postId: string) => void;
  onGenerate: (postId: string) => void;
}) {
  return (
    <PostCardShell
      post={post}
      loading={loading}
      onRemove={onRemove}
      onGenerate={onGenerate}
      dragButton={<button className="dragHandle" type="button" disabled>ลากเพื่อย้ายวัน</button>}
      className="planCard"
    />
  );
}

function PostCardShell({
  post,
  loading,
  onGenerate,
  onRemove,
  dragButton,
  className,
  refCallback,
  style
}: {
  post: WeeklyPlanPost;
  loading: boolean;
  onGenerate: (postId: string) => void;
  onRemove: (postId: string) => void;
  dragButton?: React.ReactNode;
  className?: string;
  refCallback?: (element: HTMLElement | null) => void;
  style?: React.CSSProperties;
}) {
  return (
    <article className={className || "planCard"} ref={refCallback} style={style}>
      {dragButton}
      <div className="planTopline">
        <span className={`typePill type${post.postType}`}>{postTypeLabels[post.postType]}</span>
        <span className={`statusPill ${post.status}`}>{statusLabel(post.status)}</span>
        <span className="priorityPill">{priorityLabel(post.priority)}</span>
      </div>
      <h3>{post.productFocus}</h3>
      <p>{post.reason}</p>
      <div className="planMeta">
        <span>{post.category}</span>
        <span>แจ้งเตือน {post.reminderAt}</span>
        <span>รหัส {post.productCode}</span>
      </div>
      <div className="planActions">
        <button className="secondaryButton" onClick={() => onRemove(post.id)} disabled={loading} style={{ borderColor: 'rgba(248, 113, 113, 0.4)', color: '#fca5a5' }}>
          ลบโพสต์
        </button>
        <button className="primaryButton" onClick={() => onGenerate(post.id)} disabled={loading || post.status === "generated"}>
          {post.status === "generated" ? "แก้ไข Content" : "Generate Content"}
        </button>
      </div>
      {post.generatedAsset ? (
        <div className="assetBox">
          <h4>แคปชัน + พรอมป์ภาพ</h4>
          <p>{post.generatedAsset.caption}</p>
          <p>
            <strong>พรอมป์ภาพ:</strong> {post.generatedAsset.artworkPrompt}
          </p>
          <p>
            <strong>แฮชแท็ก:</strong> {post.generatedAsset.hashtags.join(" ")}
          </p>
          <p>
            <strong>เทรนด์ที่อิง:</strong> {post.generatedAsset.trendSummary}
          </p>
          <p>
            <strong>แหล่งอ้างอิง:</strong> {post.generatedAsset.trendSourceLabels.join(", ") || "-"}
          </p>
          <div className="planActions">
            <button className="primaryButton compactButton" onClick={() => onGenerate(post.id)} disabled={loading} style={{ width: '100%' }}>
              รีเจน Content ใหม่
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
