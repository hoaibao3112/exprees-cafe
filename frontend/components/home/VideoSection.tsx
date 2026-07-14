'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Sparkles, X } from 'lucide-react';
import { useVideosQuery } from '@/hooks/useContentQueries';
import { resolveUploadUrl } from '@/lib/api';

export function VideoSection() {
  const { data: videos, isLoading: isLoadingVideos } = useVideosQuery();
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  return (
    <section id="videos" className="py-24 bg-zinc-50 relative overflow-hidden border-t border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="section-title-wrapper mb-16 text-center" data-animate="fade-up">
          <span className="text-xs font-black uppercase tracking-widest text-[#f07b22] bg-[#f07b22]/10 px-4 py-2 rounded-full border border-[#f07b22]/20">
            Truyền Thông
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-wider uppercase mt-4">
            KÊNH <span className="gradient-text">VIDEO</span>
          </h2>
          <div className="section-underline mt-3 mx-auto" />
        </div>

        {isLoadingVideos ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-zinc-150 overflow-hidden shadow-sm h-[280px] p-4 flex flex-col gap-4">
                <div className="skeleton w-full h-40 rounded-2xl" />
                <div className="skeleton h-6 w-5/6" />
                <div className="skeleton h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : !videos || videos.length === 0 ? (
          <div className="text-center py-16 p-8 border border-dashed border-zinc-200 bg-white rounded-3xl max-w-md mx-auto shadow-sm">
            <Sparkles className="w-12 h-12 text-orange-400 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-zinc-700">Chưa có video nào</h3>
            <p className="text-sm text-zinc-400 mt-1">Đang cập nhật video clip mới từ kênh chính thức.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {videos.slice(0, 3).map((video, idx) => {
              const yId = getYoutubeId(video.youtubeUrl);
              return (
                <div
                  key={video.id}
                  data-animate="fade-up"
                  data-delay={String((idx + 1) * 100)}
                  onClick={() => yId && setPlayingVideo(yId)}
                  className="group bg-white rounded-3xl border border-zinc-200/80 overflow-hidden hover:border-orange-300 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Video Thumbnail with play icon */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                      <Image
                        src={resolveUploadUrl(video.thumbnailUrl)}
                        alt={video.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-100"
                      />
                      
                      {/* Premium YouTube-like Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-black/35 group-hover:bg-red-700 group-hover:scale-110 transition-all duration-300">
                          <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="p-5 space-y-1">
                      <h3 className="font-bold text-sm sm:text-base text-zinc-950 leading-snug tracking-wide line-clamp-2 group-hover:text-orange-500 transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-zinc-400 font-extrabold tracking-widest uppercase">
                        {video.channelName}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dynamic YouTube Video Lightbox Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-opacity duration-300">
          <div className="relative w-full max-w-4xl aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <button
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-red-650 text-white flex items-center justify-center font-bold transition-all hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </section>
  );
}
