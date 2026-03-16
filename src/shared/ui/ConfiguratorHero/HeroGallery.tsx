import { useState, useRef, useEffect, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Mousewheel } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroMediaItem } from '@shared/ui/ConfiguratorHero/types'
import { VideoModal } from '@shared/ui/ConfiguratorHero/VideoModal'
import { useMediaQuery } from '@shared/hooks/useMediaQuery'

import 'swiper/swiper-bundle.css'

interface HeroGalleryProps {
  media: HeroMediaItem[]
  productName: string
}

type ScrollPosition = 'start' | 'end' | 'middle' | 'none'

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

export function HeroGallery({ media, productName }: HeroGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>('start')
  const swiperRef = useRef<SwiperType | null>(null)
  const mainSwiperRef = useRef<SwiperType | null>(null)

  const isDesktop = useMediaQuery('(min-width: 1280px)')
  const activeItem = media[activeIndex]
  const hasMultipleSlides = media.length > 1

  const updateScrollPosition = useCallback((swiper: SwiperType) => {
    if (!swiper) return

    const { isBeginning, isEnd } = swiper

    if (isBeginning && isEnd) {
      setScrollPosition('none')
    } else if (isBeginning) {
      setScrollPosition('start')
    } else if (isEnd) {
      setScrollPosition('end')
    } else {
      setScrollPosition('middle')
    }
  }, [])

  useEffect(() => {
    if (swiperRef.current) {
      updateScrollPosition(swiperRef.current)
    }
  }, [media, updateScrollPosition])

  // Sync main swiper with activeIndex when switching from desktop to mobile
  useEffect(() => {
    if (
      !isDesktop &&
      mainSwiperRef.current &&
      mainSwiperRef.current.activeIndex !== activeIndex
    ) {
      mainSwiperRef.current.slideTo(activeIndex, 0)
    }
  }, [isDesktop, activeIndex])

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index)
  }

  const handleMainClick = () => {
    if (activeItem.type === 'video') {
      setVideoModalOpen(true)
    }
  }

  const handleMainSwipe = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex)
  }

  const goToPrev = () => {
    mainSwiperRef.current?.slidePrev()
  }

  const goToNext = () => {
    mainSwiperRef.current?.slideNext()
  }

  const showFadeStart = scrollPosition === 'middle' || scrollPosition === 'end'
  const showFadeEnd = scrollPosition === 'start' || scrollPosition === 'middle'

  const showLeftArrow = !isDesktop && hasMultipleSlides && activeIndex > 0
  const showRightArrow = !isDesktop && hasMultipleSlides && activeIndex < media.length - 1

  // ── Shared render for a single media item ──
  const renderMediaItem = (item: HeroMediaItem, index: number) => {
    if (item.type === 'image') {
      return (
        <div className="relative z-10 flex h-full w-full items-center justify-center p-6 md:p-8">
          <img
            src={item.src}
            alt={item.alt ?? `${productName} ${index + 1}`}
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />
        </div>
      )
    }

    return (
      <button
        onClick={handleMainClick}
        className="relative z-10 flex h-full w-full cursor-pointer items-center justify-center outline-none focus:outline-none"
        aria-label={`Play video: ${item.title}`}
      >
        <img
          src={getYouTubeThumbnail(item.src)}
          alt={item.title ?? 'Video thumbnail'}
          className="max-h-full max-w-full object-contain"
          draggable={false}
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
    )
  }

  // ── Main image area ──
  const renderMainArea = () => {
    const containerClass =
      'hero-gallery-main group relative aspect-3/2 w-full overflow-hidden rounded-sm border border-slate-200 bg-slate-50 md:aspect-4/3 xl:flex-1'

    if (isDesktop) {
      // Desktop: static image, controlled by thumbnail clicks
      return (
        <div className={`${containerClass} xl:order-2`}>
          <div className="tech-grid absolute inset-0 opacity-50" />
          <div className="transition-transform duration-500 group-hover:scale-105 h-full w-full">
            {renderMediaItem(activeItem, activeIndex)}
          </div>
        </div>
      )
    }

    // Mobile/Tablet: swipeable main area
    return (
      <div className={`${containerClass} order-1`}>
        <div className="tech-grid absolute inset-0 opacity-50" />

        <Swiper
          onSwiper={(swiper) => {
            mainSwiperRef.current = swiper
          }}
          onSlideChange={handleMainSwipe}
          initialSlide={activeIndex}
          slidesPerView={1}
          spaceBetween={0}
          speed={300}
          className="h-full w-full"
        >
          {media.map((item, index) => (
            <SwiperSlide key={index} className="h-full w-full">
              {renderMediaItem(item, index)}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Left arrow */}
        {showLeftArrow && (
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 shadow-sm backdrop-blur-sm transition-all active:scale-95 md:h-9 md:w-9"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        )}

        {/* Right arrow */}
        {showRightArrow && (
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 shadow-sm backdrop-blur-sm transition-all active:scale-95 md:h-9 md:w-9"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        )}

        {/* Dot pagination */}
        {hasMultipleSlides && (
          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => mainSwiperRef.current?.slideTo(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-4 bg-brand-600' : 'w-1.5 bg-slate-300'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="relative flex w-full flex-col gap-3 md:gap-4 xl:flex-row xl:gap-6">
        {/* Thumbnail strip — desktop only */}
        <div className="hidden xl:block relative order-2 w-full xl:order-1 xl:w-22">
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
              swiperRef.current = swiper
              updateScrollPosition(swiper)
            }}
            onSlideChange={updateScrollPosition}
            onScroll={updateScrollPosition}
            onProgress={updateScrollPosition}
            breakpoints={{
              1280: {
                direction: 'vertical',
                slidesPerView: 4,
                spaceBetween: 12,
              },
            }}
            className="hero-gallery-swiper h-16 w-full md:h-12 xl:w-full"
          >
            {media.map((item, index) => (
              <SwiperSlide key={index} className="h-22! w-22!">
                <button
                  onClick={() => handleThumbnailClick(index)}
                  className={`relative h-full w-full select-none overflow-hidden rounded-sm outline-none transition-colors focus:outline-none ${
                    activeIndex === index
                      ? 'border-2 border-brand-600'
                      : 'border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {item.type === 'image' ? (
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

        {renderMainArea()}
      </div>

      {activeItem.type === 'video' && (
        <VideoModal
          isOpen={videoModalOpen}
          videoId={activeItem.src}
          title={activeItem.title}
          onClose={() => setVideoModalOpen(false)}
        />
      )}
    </>
  )
}
