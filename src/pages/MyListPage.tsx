import { Link } from "react-router-dom";
import { useConfigurationStore, useMyList } from "../stores/configurationStore";
import { ProductCard } from "../components/ProductCard";
import { toast } from "../utils/toast";

export function MyListPage() {
  const myList = useMyList();
  const removeFromMyList = useConfigurationStore((state) => state.removeFromMyList);
  const clearMyList = useConfigurationStore((state) => state.clearMyList);

  const handleClearAll = () => {
    toast.confirm("Are you sure you want to clear all saved configurations?", () => {
      clearMyList();
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        {myList.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-7 lg:gap-12">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:gap-6">
              <div className="max-w-200 flex-1">
                <h4 className="font-bold text-lg lg:text-2xl mb-4">My List</h4>
                <p className="font-medium text-base lg:text-md">
                  Add products to your list by clicking the star icon on product pages or listings. Once added, your list of products can be easily emailed to one of our distributors or anyone of your choosing.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="cursor-pointer inline-flex items-center justify-center relative ring-offset-0 transition-all duration-300 ease-in-out focus-visible:outline-none box-border font-bold text-sm gap-1 px-4.5 py-0.5 min-h-9 border-4 lg:gap-1.5 lg:px-6 lg:py-1 lg:min-h-11 lg:text-base bg-brand-600 border-brand-600 text-white hover:bg-brand-700 hover:border-brand-700 h-max w-full basis-1/2 text-nowrap"
                >
                  Send My List
                </button>
                <div className="w-full basis-1/2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="cursor-pointer inline-flex items-center justify-center relative ring-offset-0 transition-all duration-300 ease-in-out focus-visible:outline-none box-border font-bold text-sm gap-1 px-4.5 py-0.5 min-h-9 border-4 lg:gap-1.5 lg:px-6 lg:py-1 lg:min-h-11 lg:text-base bg-gray-500 border-gray-500 text-white hover:bg-gray-600 hover:border-gray-600 h-max w-full text-nowrap"
                  >
                    Clear My List
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
              {myList.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onRemove={removeFromMyList}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col gap-7 lg:gap-12">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:gap-6">
        <div className="max-w-200 flex-1">
          <h4 className="font-bold text-lg lg:text-2xl mb-4">My List</h4>
          <p className="font-medium text-base lg:text-md">
            Add products to your list by clicking the star icon on product pages or listings. Once added, your list of products can be easily emailed to one of our distributors or anyone of your choosing.
          </p>
        </div>
      </div>

      <div className="text-center py-16 bg-white border-2 border-gray-200">
        <div className="text-6xl mb-4">☆</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Your list is empty
        </h2>
        <p className="text-gray-600 mb-6">
          Configure a product and add it to your list to save it for later.
        </p>
        <Link
          to="/"
          className="cursor-pointer inline-flex items-center justify-center font-bold text-sm gap-1 px-4.5 py-0.5 min-h-9 border-4 lg:gap-1.5 lg:px-6 lg:py-1 lg:min-h-11 lg:text-base bg-brand-600 border-brand-600 text-white hover:bg-brand-700 hover:border-brand-700 transition-all duration-300"
        >
          Start Configuring
        </Link>
      </div>
    </div>
  );
}