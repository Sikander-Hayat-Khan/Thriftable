import Link from "next/link";
import Image from "next/image";
import { catalogueItems } from "@/data/products";
import ProductDetailActions from "@/components/product-detail-actions";

export default async function ProductDetailPage({ params }) {
  // Await params asynchronously to strictly conform with Next.js 15+ async params standard
  const resolvedParams = await params;
  const productId = resolvedParams?.id;

  const product =
    catalogueItems.find((item) => item.id === productId) || catalogueItems[0];

  return (
    <div className="min-h-screen w-full pt-20 pb-24 bg-white text-neutral-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        {/* Breadcrumb Bar */}
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-neutral-400 pb-8 border-b border-black/10">
          <Link href="/shop" className="hover:text-neutral-900 transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link
            href={`/shop?category=${product.category}`}
            className="hover:text-neutral-900 transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">{product.name}</span>
        </div>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-12 items-start">
          {/* Left Column: Rectangular Image Presentation */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-3/4 w-full overflow-hidden bg-neutral-100 border border-black/10 rounded-none">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                quality={100}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className={`object-cover ${product.objectPosition || "object-center"} rounded-none`}
              />
            </div>
          </div>

          {/* Right Column: Minimalist Product Details */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
            {/* Top Metadata */}
            <div className="flex items-center justify-between text-xs font-mono tracking-widest text-neutral-500 uppercase">
              <span>{product.size} • {product.gender}</span>
              <span className="text-[#B2A376] font-medium">{product.condition}</span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-macsans font-bold tracking-wide text-neutral-900 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="text-2xl font-mono font-semibold text-neutral-900">
              {product.price}
            </div>

            {/* Description */}
            <p className="text-sm font-proda text-neutral-600 leading-relaxed pt-2">
              {product.description}
            </p>

            {/* Color Swatches */}
            <div className="pt-4 border-t border-black/10 flex flex-col gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                Available Shades
              </span>
              <div className="flex items-center gap-3 pt-1">
                {product.colors.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-none border border-black/20 inline-block"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs font-mono text-neutral-500">
                      {color.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <ProductDetailActions product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
