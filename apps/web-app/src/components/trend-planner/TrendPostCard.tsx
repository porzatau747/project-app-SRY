import React from "react";
import type { TrendContentPost } from "../../types/planner";

export function TrendPostCard({ post }: { post: TrendContentPost }) {
  return (
    <article className="trendPostCard">
      <div className="trendPostHeader">
        <span>{post.day}</span>
        <strong>{post.pillar}</strong>
      </div>
      <h3>{post.topic}</h3>
      <div className="planTopline">
        <span className="typePill typeMeme">{post.contentType}</span>
      </div>
      <p>{post.trendSignal}</p>
      
      <div className="detailColumns">
        <div>
          <h4>Hook</h4>
          <p>{post.hook}</p>
        </div>
      </div>
      
      <div className="trendFooter">
        <span>{post.suggestedFormat}</span>
        <span>{post.cta}</span>
      </div>
    </article>
  );
}
