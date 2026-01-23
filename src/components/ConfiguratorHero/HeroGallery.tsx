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

  const getMaskClass = (): string => {
    // Mobile: horizontal (left/right)
    // Desktop: vertical (top/bottom)
    // start = в начале, градиент только снизу/справа
    // end = в конце, градиенты с обеих сторон (как middle)
    // middle = посередине, градиенты с обеих сторон
    // none = нет скролла, без градиентов
    switch (scrollPosition) {
      case "start":
        // В начале — градиент только снизу (desktop) / справа (mobile)
        return "[mask-image:linear-gradient(to_right,#000_calc(100%-100px),transparent)] lg:[mask-image:linear-gradient(to_bottom,#000_calc(100%-100px),transparent)]";
      case "end":
      case "middle":
        // В конце или посередине — градиенты с обеих сторон
        return "[mask-image:linear-gradient(to_right,transparent,#000_100px,#000_calc(100%-100px),transparent)] lg:[mask-image:linear-gradient(to_bottom,transparent,#000_100px,#000_calc(100%-100px),transparent)]";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="relative flex w-full flex-col gap-4 lg:flex-row lg:gap-8">
        <div className={`order-2 w-full lg:order-1 lg:w-22 ${getMaskClass()}`}>
          <Swiper
            modules={[FreeMode, Mousewheel]}
            direction="horizontal"
            slidesPerView="auto"
            spaceBetween={12}
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
              1024: {
                direction: "vertical",
                slidesPerView: "auto",
                spaceBetween: 12,
              },
            }}
            className="h-12 w-full lg:h-[600px] lg:w-full"
          >
            {media.map((item, index) => (
              <SwiperSlide
                key={index}
                className="h-12! w-12! lg:h-22! lg:w-full!"
              >
                <button
                  onClick={() => handleThumbnailClick(index)}
                  className={`relative h-full w-full select-none overflow-hidden outline-none focus:outline-none ${
                  activeIndex === index
                    ? "border-2 border-gray-300"
                    : "border border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.src}
                      alt={item.alt ?? `${productName} thumbnail ${index + 1}`}
                      draggable={false}
                      className="h-full w-full select-none object-contain p-0.5 lg:p-1"
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
                          className="h-5 w-5 text-white lg:h-6 lg:w-6"
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

        <div className="order-1 flex aspect-square w-full items-center justify-center lg:order-2 lg:flex-1">
          {activeItem.type === "image" ? (
            <img
              src={activeItem.src}
              alt={activeItem.alt ?? productName}
              className="h-full w-full object-contain"
            />
          ) : (
            <button
              onClick={handleMainClick}
              className="relative h-full w-full cursor-pointer outline-none focus:outline-none"
              aria-label={`Play video: ${activeItem.title}`}
            >
              <img
                src={getYouTubeThumbnail(activeItem.src)}
                alt={activeItem.title ?? "Video thumbnail"}
                className="h-full w-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 lg:h-20 lg:w-20">
                  <svg
                    className="ml-1 h-8 w-8 lg:h-10 lg:w-10"
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