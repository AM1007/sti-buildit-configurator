import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { getAllProducts } from "../data/productRegistry";
import { ConfiguratorCard } from "../components/ConfiguratorCard";
import { PrimaryNavigation } from "../components/PrimaryNavigation";
import { ResultCounter, EmptyState } from "../components/FilterResults";
import { useFilterState } from "../hooks/useFilterState";
import { useTranslation } from "../i18n";

export function HomePage() {
  const { t } = useTranslation();
  const catalogRef = useRef<HTMLElement>(null);
  const heroEndRef = useRef<HTMLDivElement>(null);
  const {
    state,
    displayed,
    filtered,
    viewMode,
    isPaginated,
    hasMore,
    setPrimary,
    clearFilters,
    setViewMode,
    loadMore,
    togglePagination,
  } = useFilterState(getAllProducts().map((p) => p.meta));

  const scrollToCatalog = () => {
    heroEndRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col justify-center px-4 py-10 md:px-6 md:py-16 xl:px-8 xl:py-24"
          >
            <h1 className="mb-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl xl:text-5xl">
              {t("home.heroTitle")}
            </h1>

            <p className="mb-8 max-w-md text-[15px] text-slate-600 md:text-lg md:text-slate-500">
              {t("home.heroDescription")}
            </p>

            <div>
              <button
                type="button"
                onClick={scrollToCatalog}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-brand-600 px-6 text-[15px] font-medium text-white transition-colors hover:bg-brand-700 md:h-10 md:w-auto md:text-sm"
              >
                {t("hero.startConfig")}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="relative hidden min-h-[300px] items-center justify-center overflow-hidden border-l border-slate-200 bg-white tech-grid md:flex"
          >
            <div className="relative flex h-80 w-72 flex-col border border-slate-300 bg-white/50 p-4 shadow-sm backdrop-blur-sm xl:h-96 xl:w-96">
              <div className="mb-4 flex justify-between border-b border-slate-200 pb-2">
                <div className="h-2 w-12 rounded-sm bg-slate-200" />
                <div className="h-2 w-4 rounded-sm bg-slate-200" />
              </div>
              <div className="flex flex-1 items-center justify-center border border-dashed border-slate-300 bg-slate-50">
                <img
                  alt="STI Configurator Device"
                  src="/hero-device.webp"
                  width={200}
                  height={200}
                  className="h-auto w-3/4 object-contain"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="h-2 w-full rounded-sm bg-slate-200" />
                <div className="h-2 w-full rounded-sm bg-slate-200" />
              </div>
              <div className="absolute -right-8 top-0 flex h-full w-px items-center justify-center bg-slate-300">
                <span className="-rotate-90 bg-slate-50 px-1 font-mono text-[10px] text-slate-400">
                  240mm
                </span>
              </div>
              <div className="absolute -bottom-8 left-0 flex h-px w-full items-center justify-center bg-slate-300">
                <span className="bg-slate-50 px-1 font-mono text-[10px] text-slate-400">
                  180mm
                </span>
              </div>
            </div>
          </motion.div>
        </div>
        <div ref={heroEndRef} className="scroll-mt-14 md:scroll-mt-16" />
      </section>

      <section ref={catalogRef} className="scroll-mt-16 py-8 md:scroll-mt-0 md:py-12">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 xl:px-8">
          <div className="sticky top-14 z-40 -mx-4 border-b border-slate-200 bg-slate-50 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              <PrimaryNavigation value={state.primary} onChange={setPrimary} />
              <div className="flex items-center justify-between">
                <ResultCounter
                  shown={displayed.length}
                  total={filtered.length}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  isPaginated={isPaginated}
                  onTogglePagination={togglePagination}
                />
              </div>
            </div>
          </div>

          <div className="hidden md:flex md:flex-col md:gap-4 md:mb-6">
            <PrimaryNavigation value={state.primary} onChange={setPrimary} />
            <div className="flex items-center justify-end">
              <ResultCounter
                shown={displayed.length}
                total={filtered.length}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                isPaginated={isPaginated}
                onTogglePagination={togglePagination}
              />
            </div>
          </div>

          {filtered.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 gap-px border border-slate-200 bg-slate-200 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  <AnimatePresence mode="popLayout">
                    {displayed.map((config, i) => (
                      <ConfiguratorCard
                        key={config.id}
                        config={config}
                        index={i}
                        viewMode="grid"
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col gap-px border border-slate-200 bg-slate-200">
                  <AnimatePresence mode="popLayout">
                    {displayed.map((config, i) => (
                      <ConfiguratorCard
                        key={config.id}
                        config={config}
                        index={i}
                        viewMode="list"
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    className="flex items-center gap-2 rounded-sm border border-slate-200 bg-white px-6 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:border-slate-300 cursor-pointer md:py-2 md:text-xs"
                  >
                    {t("grid.loadMore")}
                    <ChevronDown className="h-3.5 w-3.5 md:h-3 md:w-3" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState onClear={clearFilters} />
          )}
        </div>
      </section>
    </div>
  );
}