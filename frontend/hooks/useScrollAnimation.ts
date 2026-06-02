'use client';

import { useEffect } from 'react';

export function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            // Không unobserve — giữ class khi scroll lên lại
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    
    document.querySelectorAll('[data-animate]')
      .forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);
}
