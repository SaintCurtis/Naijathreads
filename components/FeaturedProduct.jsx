import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const collections = [
  {
    id: 1,
    image: assets.featured_owambe_image,
    alt: "Family in matching brown lace with gele, fila caps and coral beads",
    title: "Owambe Ready",
    description: "Matching lace, gele and coral beads for the whole family. Arrive together, stand out together.",
  },
  {
    id: 2,
    image: assets.featured_everyday_image,
    alt: "Man in teal aso oke agbada and sokoto with beads and a carved walking stick",
    title: "Everyday Heritage",
    description: "Buba, sokoto and dashiki-inspired sets with easy comfort and serious presence, any day of the week.",
  },
  {
    id: 3,
    image: assets.featured_bigman_image,
    alt: "Man in white embroidered agbada with black beads and a carved staff",
    title: "The Big Man Look",
    description: "Agbada and senator sets cut sharp for the man who leads.",
  },
];

const FeaturedProduct = () => {
  const { router } = useAppContext();

  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Featured Collections</p>
        <div className="w-28 h-0.5 bg-gold-500 mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {collections.map(({ id, image, alt, title, description }) => (
          <div
            key={id}
            className="relative group aspect-[4/5] overflow-hidden rounded-xl cursor-pointer"
            onClick={() => router.push("/all-products")}
          >
            <Image
              src={image}
              alt={alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover object-top transition duration-500 group-hover:scale-105"
            />
            {/* Dark fade at the bottom keeps the white text readable on any photo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>

            <div className="group-hover:-translate-y-2 transition duration-300 absolute bottom-8 left-8 right-8 text-white space-y-2">
              <p className="font-medium text-xl lg:text-2xl">{title}</p>
              <p className="text-sm lg:text-base leading-5 max-w-72 text-white/90">
                {description}
              </p>
              <button className="flex items-center gap-1.5 bg-gold-400 text-forest-900 font-medium px-4 py-2 rounded hover:bg-gold-300 transition">
                Shop now <Image className="h-3 w-3 group-hover:translate-x-0.5 transition" src={assets.arrow_icon} alt="" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProduct;
