"use client";

import React, { useEffect, useRef, useState } from 'react';

export function FadeUpReveal({ children, delay = 0, className = "", style }: { children: React.ReactNode, delay?: number, className?: string, style?: React.CSSProperties }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    
    if (domRef.current) {
      observer.observe(domRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`fade-up-section ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}
