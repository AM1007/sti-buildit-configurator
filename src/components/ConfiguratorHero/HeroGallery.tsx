import { useState, useRef, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import type { HeroMediaItem } from "./types";
import { VideoModal } from "./VideoModal";

import "swiper/swiper-bundle.css";

interface HeroGalleryProps {
  media: HeroMediaItem[];
  productName: string;
}

type ScrollPosition = "start" | "end" | "middle" | "none";

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export function HeroGallery({ media, productName }: HeroGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>("start");
  const swiperRef = useRef<SwiperType | null>(null);

  const activeItem = media[activeIndex];

  const updateScrollPosition = useCallback((swiper: SwiperType) => {
    if (!swiper) return;

    const { isBeginning, isEnd } = swiper;

    if (isBeginning && isEnd) {
      setScrollPosition("none");
    } else if (isBeginning) {
      setScrollPosition("start");
    } else if (isEnd) {
      setScrollPosition("end");
    } else {
      setScrollPosition("middle");
    }
  }, []);

  useEffect(() => {
    if (swiperRef.current) {
      updateScrollPosition(swiperRef.current);
    }
  }, [media, updateScrollPosition]);

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleMainClick = () => {
    if (activeItem.type === "video") {
      setVideoModalOpen(true);
    }
  };

  const showFadeStart = scrollPosition === "middle" || scrollPosition === "end";
  const showFadeEnd = scrollPosition === "start" || scrollPosition === "middle";

  return (
    <>
      <div className="relative flex w-full flex-col gap-3 md:gap-4 xl:flex-row xl:gap-6">
        <div className="relative order-2 w-full xl:order-1 xl:w-22">
          {showFadeStart && (
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-linear-to-r from-white to-transparent xl:h-16 xl:w-full xl:bg-linear-to-b" />
          )}
          {showFadeEnd && (
            <div className="pointer-events-none absolute bottom-0 right-0 z-10 h-full w-16 bg-linear-to-l from-white to-transparent xl:h-16 xl:w-full xl:bg-linear-to-t" />
          )}

          <Swiper
            modules={[FreeMode, Mousewheel]}
            direction="horizontal"
            slidesPerView={3.5}
            spaceBetween={8}
            freeMode={{ enabled: true, momentum: true, momentumRatio: 0.5 }}
            speed={400}
            mousewheel={{ forceToAxis: true }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              updateScrollPosition(swiper);
            }}
            onSlideChange={updateScrollPosition}
            onScroll={updateScrollPosition}
            onProgress={updateScrollPosition}
            breakpoints={{
              768: {
                slidesPerView: 4,
                spaceBetween: 12,
              },
              1280: {
                direction: "vertical",
                slidesPerView: 4,
                spaceBetween: 12,
              },
            }}
            className="hero-gallery-swiper h-16 w-full md:h-12 xl:w-full"
          >
            {media.map((item, index) => (
              <SwiperSlide
                key={index}
                className="h-22! w-22!"
              >
                <button
                  onClick={() => handleThumbnailClick(index)}
                  className={`relative h-full w-full select-none overflow-hidden rounded-sm outline-none transition-colors focus:outline-none ${
                    activeIndex === index
                      ? "border-2 border-brand-600"
                      : "border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.src}
                      alt={item.alt ?? `${productName} thumbnail ${index + 1}`}
                      draggable={false}
                      className="h-full w-full select-none object-contain p-0.5 xl:p-1"
                    />
                  ) : (
                    <div className="relative h-full w-full">
                      <img
                        src={getYouTubeThumbnail(item.src)}
                        alt={item.title ?? `Video ${index + 1}`}
                        draggable={false}
                        className="h-full w-full select-none object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg
                          className="h-5 w-5 text-white md:h-6 md:w-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div
          className="hero-gallery-main group relative order-1 aspect-3/2 w-full overflow-hidden rounded-sm border border-slate-200 bg-slate-50 md:aspect-4/3 xl:order-2 xl:flex-1"
        >
          <div className="tech-grid absolute inset-0 opacity-50" />

          {activeItem.type === "image" ? (
            <div className="relative z-10 flex h-full w-full items-center justify-center p-6 transition-transform duration-500 group-hover:scale-105 md:p-8">
              <img
                src={activeItem.src}
                alt={activeItem.alt ?? productName}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <button
              onClick={handleMainClick}
              className="relative z-10 flex h-full w-full cursor-pointer items-center justify-center outline-none focus:outline-none"
              aria-label={`Play video: ${activeItem.title}`}
            >
              <img
                src={getYouTubeThumbnail(activeItem.src)}
                alt={activeItem.title ?? "Video thumbnail"}
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-110 md:h-16 md:w-16 xl:h-20 xl:w-20">
                  <svg
                    className="ml-1 h-7 w-7 md:h-8 md:w-8 xl:h-10 xl:w-10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {activeItem.type === "video" && (
        <VideoModal
          isOpen={videoModalOpen}
          videoId={activeItem.src}
          title={activeItem.title}
          onClose={() => setVideoModalOpen(false)}
        />
      )}
    </>
  );
}