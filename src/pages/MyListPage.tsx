import { Link, useNavigate } from "react-router-dom";
import { useConfigurationStore, useMyList } from "../stores/configurationStore";
import { getModelById } from "../data/models";
import { MODEL_NAMES } from "../types";
import type { SavedConfiguration } from "../types";

export function MyListPage() {
  const myList = useMyList();
  const navigate = useNavigate();
  
  const removeFromMyList = useConfigurationStore((state) => state.removeFromMyList);
  const clearMyList = useConfigurationStore((state) => state.clearMyList);
  const loadFromMyList = useConfigurationStore((state) => state.loadFromMyList);

  const handleLoad = (item: SavedConfiguration) => {
    loadFromMyList(item.id);
    const model = getModelById(item.modelId);
    if (model) {
      navigate(`/configurator/${model.slug}`);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Toast notification
      alert(`${type} copied to clipboard!`);
    } catch {
      prompt(`Copy this ${type}:`, text);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all saved configurations?")) {
      clearMyList();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-700 text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/" className="text-2xl font-bold hover:text-red-100">
                Build <span className="bg-white text-black px-1">it</span>
              </Link>
              <h1 className="text-xl mt-2">My List</h1>
            </div>
            
            <Link
              to="/"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm"
            >
              ← Back to Products
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {myList.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {myList.length} saved configuration{myList.length !== 1 ? "s" : ""}
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {myList.map((item) => (
                <SavedConfigCard
                  key={item.id}
                  item={item}
                  onLoad={() => handleLoad(item)}
                  onCopyCode={() => handleCopy(item.productCode, "Model ID")}
                  onCopyUrl={() => {
                    const model = getModelById(item.modelId);
                    const url = `${window.location.origin}/configurator/${model?.slug}?code=${item.productCode}`;
                    handleCopy(url, "URL");
                  }}
                  onRemove={() => removeFromMyList(item.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

interface SavedConfigCardProps {
  item: SavedConfiguration;
  onLoad: () => void;
  onCopyCode: () => void;
  onCopyUrl: () => void;
  onRemove: () => void;
}

function SavedConfigCard({
  item,
  onLoad,
  onCopyCode,
  onCopyUrl,
  onRemove,
}: SavedConfigCardProps) {
  const modelName = MODEL_NAMES[item.modelId] ?? item.modelId;
  const savedDate = new Date(item.savedAt).toLocaleDateString();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500">{modelName}</p>
          <p className="font-mono font-bold text-lg text-gray-800 truncate">
            {item.productCode}
          </p>
          {item.name && (
            <p className="text-sm text-gray-600 mt-1">{item.name}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Saved {savedDate}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onLoad}
            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Load
          </button>
          <button
            type="button"
            onClick={onCopyCode}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
          >
            Copy ID
          </button>
          <button
            type="button"
            onClick={onCopyUrl}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
          >
            Copy URL
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="px-3 py-1.5 text-red-600 text-sm hover:bg-red-50 rounded"
            aria-label="Remove from list"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">📋</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Your list is empty
      </h2>
      <p className="text-gray-600 mb-6">
        Configure a product and add it to your list to save it for later.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
      >
        Start Configuring
      </Link>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}