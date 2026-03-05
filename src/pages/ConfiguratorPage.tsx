import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, Navigate } from "react-router-dom";
import { getConfiguratorBySlug } from "../data/catalog";
import { getModelBySlug } from "../data/models";
import { BuildItCalculator } from "../components/BuildItCalculator";
import { ConfiguratorHero } from "../components/ConfiguratorHero";
import { getHeroContent } from "../data/heroContent";
import { useConfigurationStore } from "../stores/configurationStore";
import { useProjectStore } from "../stores/projectStore";
import { useIsAuthenticated } from "../stores/authStore";
import { ProjectPicker } from "../components/ProjectPicker";
import { InDevelopmentPage } from "./InDevelopmentPage";
import { parseConfigFromUrl, serializeConfig } from "../utils/configSerializer";
import { toast } from "../utils/toast";
import { useTranslation } from "../i18n";

export function ConfiguratorPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const hasLoadedFromUrl = useRef(false);
  const { t } = useTranslation();

  const setModel = useConfigurationStore((state) => state.setModel);
  const currentModelId = useConfigurationStore((state) => state.currentModelId);
  const config = useConfigurationStore((state) => state.config);
  const customText = useConfigurationStore((state) => state.customText);
  const setConfigFromUrl = useConfigurationStore((state) => state.loadConfigFromUrl);

  const addConfiguration = useProjectStore((s) => s.addConfiguration);
  const removeConfiguration = useProjectStore((s) => s.removeConfiguration);

  const isAuthenticated = useIsAuthenticated();
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [projectRefreshToken, setProjectRefreshToken] = useState(0);

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
    hasLoadedFromUrl.current = true;

    const stateParam = searchParams.get("state");

    if (stateParam) {
      const { state } = parseConfigFromUrl(searchParams);

      if (state) {
        setModel(model.id);
        setConfigFromUrl(model.id, state.config, state.customText ?? null);
      } else {
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
  }, []);

  useEffect(() => {
    if (!hasLoadedFromUrl.current) return;
    if (currentModelId !== model.id) return;

    const isComplete = Object.values(config).some((v) => v !== null);
    if (!isComplete) {
      const url = new URL(window.location.href);
      url.searchParams.delete("state");
      window.history.replaceState(null, "", url.toString());
      return;
    }

    const serialized = serializeConfig(config, customText);
    const url = new URL(window.location.href);
    url.searchParams.set("state", serialized);
    window.history.replaceState(null, "", url.toString());
  }, [config, customText, currentModelId, model.id]);

  const heroContent = getHeroContent(model.id);

  const handleAddToMyList = () => {
    if (isAuthenticated) {
      setShowProjectPicker(true);
    } else {
      setModel(model.id);
      addConfiguration(model.id, config, customText, model);
    }
  };

  const handleRemoveFromMyList = (itemId: string) => {
    if (isAuthenticated) {
      setShowProjectPicker(true);
    } else {
      removeConfiguration(itemId);
    }
  };

  const handleProjectPickerSaved = () => {
    setProjectRefreshToken((t) => t + 1);
    toast.success(t("projectPicker.saved"));
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
          projectRefreshToken={projectRefreshToken}
        />
      </section>

      <ProjectPicker
        isOpen={showProjectPicker}
        onClose={() => setShowProjectPicker(false)}
        onSaved={handleProjectPickerSaved}
        modelId={model.id}
        config={config}
        customText={customText}
        model={model}
      />
    </div>
  );
}