import React from "react";
import type { TrendContentPost } from "../../types/planner";

export function TopPostCard({ post }: { post: TrendContentPost }) {
  return (
    <article className="topPostCard">
      <div className="scoreCircle">{post.viralScore}</div>
      <span className="tierPill">{post.tier}</span>
      <h3>{post.topic}</h3>
      <p>{post.whyViral}</p>
      <strong>{post.hook}</strong>
    </article>
  );
}
