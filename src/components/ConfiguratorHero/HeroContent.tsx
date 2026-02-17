interface HeroContentProps {
  productName: string;
  title: string;
  description: string;
}

export function HeroContent({ productName, title, description }: HeroContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xl font-bold text-primary md:text-2xl">
          {productName}
        </p>
        <h1 className="text-xl font-normal text-gray-900 md:text-2xl xl:text-4xl">
          {title}
        </h1>
      </div>

      <article
        className="space-y-3 text-base text-gray-700 md:text-lg"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
}