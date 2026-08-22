import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    id: "streetwear",
    name: "Streetwear",
    image: "/shop/categories/streetwear.jpg",
    className: "lg:col-span-5",
    objectPosition: "object-top",
  },
  {
    id: "vintage",
    name: "Vintage",
    image: "/shop/categories/vintage.jpg",
    className: "lg:col-span-4",
    objectPosition: "object-center",
  },
  {
    id: "eyewear",
    name: "Eyewear",
    image: "/shop/categories/eyewear.jpg",
    className: "lg:col-span-3",
    objectPosition: "object-top",
  },
  {
    id: "footwear",
    name: "Footwear",
    image: "/shop/categories/footwear.jpg",
    className: "lg:col-span-4",
    objectPosition: "object-bottom",
  },
  {
    id: "athletic_wear",
    name: "Athletic Wear",
    image: "/shop/categories/athletic.jpg",
    className: "lg:col-span-4",
    objectPosition: "object-center",
  },
  {
    id: "accessories",
    name: "Accessories",
    image: "/shop/categories/accessories.jpg",
    className: "lg:col-span-2",
    objectPosition: "object-center",
  },
  {
    id: "kids",
    name: "Kids",
    image: "/shop/categories/kids.jpg",
    className: "lg:col-span-2",
    objectPosition: "object-center",
  },
];

export default function ShopPage() {
  return (
    <div className="h-screen w-full overflow-hidden bg-neutral-950">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 auto-rows-fr lg:grid-rows-2 h-full w-full gap-0">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.id}`}
            className={`group relative flex items-center justify-center p-4 overflow-hidden border border-white/10 hover:border-white transition-all duration-200 select-none ${cat.className}`}
          >
            {/* Background Cover Image */}
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              priority
              quality={100}
              unoptimized
              className={`object-cover ${cat.objectPosition || "object-center"} group-hover:scale-105 transition-transform duration-500`}
            />

            {/* Black 60% overlay that adjusts on hover */}
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-200" />

            {/* Category Name */}
            <span className="relative z-10 text-base sm:text-lg lg:text-2xl font-medium tracking-widest uppercase text-white drop-shadow-md transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}



