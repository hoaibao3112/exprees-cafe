'use client';

import { useEffect } from 'react';

export function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            // Unobserve to prevent repeatedly triggering and saving resources
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    const observeAll = (root: ParentNode = document) => {
      root.querySelectorAll('[data-animate]')
        .forEach((el) => observer.observe(el));
    };

    // Observe already-present elements
    observeAll(document);

    // Also watch for elements added later (e.g., after async fetch)
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) return;
            if (node.hasAttribute && node.hasAttribute('data-animate')) {
              observer.observe(node as Element);
            }
            // also check descendants
            observeAll(node as ParentNode);
          });
        }
      }
    });

    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      observer.disconnect();
    };
  }, []);
}
