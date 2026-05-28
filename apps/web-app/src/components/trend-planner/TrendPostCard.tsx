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
        <span className="priorityPill">{post.memeType}</span>
        <span className="tierPill">{post.tier}</span>
      </div>
      <p>{post.trendSignal}</p>
      <div className="bridgeBox">
        <h4>Bridge Content</h4>
        {post.bridgeContent.map((item: string) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="detailColumns">
        <div>
          <h4>Hook</h4>
          <p>{post.hook}</p>
        </div>
        <div>
          <h4>Meme angle</h4>
          <p>{post.memeAngle}</p>
        </div>
      </div>
      <h4>แตกคอนเทนต์</h4>
      <ul>
        {post.contentBreakdown.map((item: string) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="trendFooter">
        <span>ไวรัล {post.viralScore}/100</span>
        <span>{post.suggestedFormat}</span>
        <span>{post.cta}</span>
      </div>
    </article>
  );
}
