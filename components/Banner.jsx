import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

// Front and back of the same agbada on either side of the text.
// Each photo fades into the cream card towards the centre.
const Banner = () => {
  const { router } = useAppContext();

  return (
    <div className="relative grid grid-cols-2 md:grid-cols-[1fr_minmax(320px,1.1fr)_1fr] items-stretch bg-cream my-16 rounded-xl overflow-hidden md:h-[420px]">
      {/* Front view */}
      <div className="relative h-72 md:h-full order-2 md:order-1 [mask-image:linear-gradient(to_right,black_60%,transparent)]">
        <Image
          src={assets.banner_agbada_front_image}
          alt="Man in orange and purple aso oke agbada with beads and a walking stick, front view"
          fill
          sizes="(min-width: 768px) 33vw, 50vw"
          className="object-cover object-top"
        />
      </div>

      {/* Text */}
      <div className="col-span-2 md:col-span-1 order-1 md:order-2 flex flex-col items-center justify-center text-center space-y-3 px-6 py-12 md:py-0">
        <p className="text-sm font-medium tracking-[0.2em] uppercase text-gold-600">
          Front to back, pure heritage
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold text-forest-700 max-w-[300px]">
          Wear Your Roots Anywhere
        </h2>
        <p className="max-w-[343px] font-medium text-gray-800/60">
          From Lagos to Harare and beyond, African style speaks one language. Dress like you belong to all of it.
        </p>
        <button
          onClick={() => router.push("/all-products")}
          className="group flex items-center justify-center gap-1 px-12 py-2.5 bg-forest-600 hover:bg-forest-700 transition rounded text-white"
        >
          Shop the Collection
          <Image className="group-hover:translate-x-1 transition" src={assets.arrow_icon_white} alt="" />
        </button>
      </div>

      {/* Back view */}
      <div className="relative h-72 md:h-full order-3 [mask-image:linear-gradient(to_left,black_60%,transparent)]">
        <Image
          src={assets.banner_agbada_back_image}
          alt="The same aso oke agbada from the back, showing the purple embroidery"
          fill
          sizes="(min-width: 768px) 33vw, 50vw"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
};

export default Banner;
