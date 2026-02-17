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
    switch (scrollPosition) {
      case "start":
        return "[mask-image:linear-gradient(to_right,#000_calc(100%-100px),transparent)] xl:[mask-image:linear-gradient(to_bottom,#000_calc(100%-100px),transparent)]";
      case "end":
      case "middle":
        return "[mask-image:linear-gradient(to_right,transparent,#000_100px,#000_calc(100%-100px),transparent)] xl:[mask-image:linear-gradient(to_bottom,transparent,#000_100px,#000_calc(100%-100px),transparent)]";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="relative flex w-full flex-col gap-4 xl:flex-row xl:gap-8">
        <div className={`order-2 w-full xl:order-1 xl:w-22 ${getMaskClass()}`}>
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
              1280: {
                direction: "vertical",
                slidesPerView: "auto",
                spaceBetween: 12,
              },
            }}
            className="h-12 w-full xl:h-[600px] xl:w-full"
          >
            {media.map((item, index) => (
              <SwiperSlide
                key={index}
                className="h-12! w-12! xl:h-22! xl:w-full!"
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

        <div className="order-1 flex aspect-square w-full items-center justify-center xl:order-2 xl:flex-1">
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
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 xl:h-20 xl:w-20">
                  <svg
                    className="ml-1 h-8 w-8 xl:h-10 xl:w-10"
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