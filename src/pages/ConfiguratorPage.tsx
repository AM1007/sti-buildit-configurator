import { useEffect, useRef } from "react";
import { useParams, useSearchParams, Navigate } from "react-router-dom";
import { getConfiguratorBySlug } from "../data/catalog";
import { getModelBySlug } from "../data/models";
import { BuildItCalculator } from "../components/BuildItCalculator";
import { ConfiguratorHero } from "../components/ConfiguratorHero";
import { getHeroContent } from "../data/heroContent";
import { useConfigurationStore } from "../stores/configurationStore";
import { InDevelopmentPage } from "./InDevelopmentPage";
import { parseConfigFromUrl } from "../utils/configSerializer";
import { toast } from "../utils/toast";
import { useTranslation } from "../i18n";

export function ConfiguratorPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasLoadedFromUrl = useRef(false);
  const { t } = useTranslation();

  const addToMyList = useConfigurationStore((state) => state.addToMyList);
  const removeFromMyList = useConfigurationStore((state) => state.removeFromMyList);
  const setModel = useConfigurationStore((state) => state.setModel);
  const currentModelId = useConfigurationStore((state) => state.currentModelId);

  const setConfigFromUrl = useConfigurationStore((state) => state.loadConfigFromUrl);

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  const catalogConfig = getConfiguratorBySlug(slug);

  if (!catalogConfig) {
    return <Navigate to="/" replace />;
  }

  if (!catalogConfig.isImplemented) {
    return <InDevelopmentPage />;
  }

  const model = getModelBySlug(slug);

  if (!model) {
    return <InDevelopmentPage />;
  }

  useEffect(() => {
    if (hasLoadedFromUrl.current) return;

    const stateParam = searchParams.get("state");

    if (stateParam) {
      const { state } = parseConfigFromUrl(searchParams);

      if (state) {
        setModel(model.id);
        setConfigFromUrl(model.id, state.config, state.customText ?? null);
        hasLoadedFromUrl.current = true;

        setSearchParams({}, { replace: true });
      } else {
        hasLoadedFromUrl.current = true;
        setSearchParams({}, { replace: true });

        if (currentModelId !== model.id) {
          setModel(model.id);
        }

        toast.error(t("configurator.invalidDeepLink"));
      }
    } else {
      if (currentModelId !== model.id) {
        setModel(model.id);
      }
    }
  }, [model.id, searchParams, setModel, setConfigFromUrl, setSearchParams, currentModelId, t]);

  const heroContent = getHeroContent(model.id);

  const handleAddToMyList = () => {
    setModel(model.id);
    addToMyList();
  };

  const handleRemoveFromMyList = (itemId: string) => {
    removeFromMyList(itemId);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {heroContent && (
        <ConfiguratorHero data={heroContent} productName={catalogConfig.name} />
      )}

      <section className="bg-slate-50">
        <BuildItCalculator
          model={model}
          productName={catalogConfig.name}
          onAddToMyList={handleAddToMyList}
          onRemoveFromMyList={handleRemoveFromMyList}
        />
      </section>
    </div>
  );
}