import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllModels, getModelBySlug } from "../data/models";
import { BuildItCalculator } from "../components/BuildItCalculator";
import { useConfigurationStore, buildProductModelUrl } from "../stores/configurationStore";

const DEFAULT_MODEL_SLUG = "stopper-stations";

export function HomePage() {
  const models = getAllModels();
  const [searchParams, setSearchParams] = useSearchParams();

  const modelSlug = searchParams.get("model") || DEFAULT_MODEL_SLUG;
  const activeModel = getModelBySlug(modelSlug) || getModelBySlug(DEFAULT_MODEL_SLUG)!;
  
  const addToMyList = useConfigurationStore((state) => state.addToMyList);
  const removeFromMyList = useConfigurationStore((state) => state.removeFromMyList);
  const setModel = useConfigurationStore((state) => state.setModel);
  const config = useConfigurationStore((state) => state.config);
  const currentModelId = useConfigurationStore((state) => state.currentModelId);

  useEffect(() => {
    const state = useConfigurationStore.getState();
    const isComplete = state.isComplete();
    const productCode = state.getProductCode();

    if (isComplete && productCode && currentModelId === activeModel.id) {
      const urlParams = buildProductModelUrl(activeModel.id, productCode);
      
      const url = new URL(urlParams, window.location.origin);
      const newParams: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        newParams[key] = value;
      });

      setSearchParams(newParams, { replace: true });
      
      if (window.location.hash !== "#build-it") {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#build-it`);
      }
    }
  }, [config, currentModelId, activeModel.id, activeModel.slug, setSearchParams]);

  const handleSelectModel = (slug: string) => {
    setSearchParams({ model: slug });
    
    const configuratorSection = document.getElementById("configurator");
    if (configuratorSection) {
      configuratorSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAddToMyList = () => {
    setModel(activeModel.id);
    addToMyList();
  };

  const handleRemoveFromMyList = (itemId: string) => {
    removeFromMyList(itemId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-brand-700 text-white py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4">
            Build <span className="bg-white text-black px-2">it</span>
          </h1>
          
          <p className="text-lg md:text-xl text-red-100 text-center max-w-2xl mx-auto">
            Configure your safety products with our interactive configurator.
            Select a product line to get started.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
          Choose a Product Line
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {models.map((model) => (
            <ProductSelectorButton
              key={model.id}
              name={model.name}
              slug={model.slug}
              stepCount={model.steps.length}
              isActive={model.slug === activeModel.slug}
              onSelect={handleSelectModel}
            />
          ))}
        </div>
      </section>

      <section id="configurator" className="bg-white border-t border-gray-200">
        <div className="max-w-8xl mx-auto">
          <div className="px-4 py-6 border-b border-gray-200">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Configure: {activeModel.name}
            </h2>
          </div>
          
          <BuildItCalculator
            model={activeModel}
            onAddToMyList={handleAddToMyList}
            onRemoveFromMyList={handleRemoveFromMyList}
          />
        </div>
      </section>

      <section className="bg-gray-50 py-12 md:py-16 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InfoCard
              step="1"
              title="Select Product"
              description="Choose from our range of safety products above"
            />
            <InfoCard
              step="2"
              title="Configure Options"
              description="Customize colours, features, and specifications"
            />
            <InfoCard
              step="3"
              title="Get Your Code"
              description="Receive your unique product model code for ordering"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

interface ProductSelectorButtonProps {
  name: string;
  slug: string;
  stepCount: number;
  isActive: boolean;
  onSelect: (slug: string) => void;
}

function ProductSelectorButton({
  name,
  slug,
  stepCount,
  isActive,
  onSelect,
}: ProductSelectorButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(slug)}
      className={`
        group block w-full text-left bg-white rounded-xl shadow-md 
        transition-all duration-200 overflow-hidden border-2
        ${isActive 
          ? "border-brand-600 ring-2 ring-brand-600 ring-offset-2" 
          : "border-gray-100 hover:border-red-200 hover:shadow-xl hover:-translate-y-1"
        }
      `}
      aria-pressed={isActive}
    >
      <div className="bg-gray-800 p-6" />

      <div className="p-4">
        <h3 className={`font-bold transition-colors ${isActive ? "text-brand-600" : "text-gray-800 group-hover:text-brand-600"}`}>
          {name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {stepCount} configuration steps
        </p>

        {isActive && (
          <div className="mt-3 flex items-center text-brand-600 text-sm font-medium">
            <span>Currently configuring</span>
            <svg
              className="w-4 h-4 ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {!isActive && (
          <div className="mt-3 flex items-center text-brand-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Configure</span>
            <svg
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}

interface InfoCardProps {
  step: string;
  title: string;
  description: string;
}

function InfoCard({ step, title, description }: InfoCardProps) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {step}
      </div>
      <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}