import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

// Each slide's background is sampled from the edge of its photo, and the
// photo fades into that colour (mask-image), so it reads as one piece
// instead of a picture pasted on a card.
const sliderData = [
  {
    id: 1,
    title: "Rooted in Culture. Worn with Pride.",
    offer: "Authentic Nigerian Traditional Wear, Now in Zimbabwe",
    buttonText1: "Shop Now",
    buttonText2: "Our Story",
    imgSrc: assets.header_couple_image,
    imgAlt: "Couple in matching wine agbada, coral beads, lace and aso oke with gele",
    bg: "#6F1F20",
    dark: true,
    focus: "object-[center_25%]",
  },
  {
    id: 2,
    title: "Agbada, Senator & Kaftan for Men Who Command the Room",
    offer: "Tailored for Weddings, Owambes & Sunday Best",
    buttonText1: "Shop Men",
    buttonText2: "Explore Styles",
    imgSrc: assets.header_agbada_kaftan_image,
    imgAlt: "Dusty pink agbada with embroidered kaftan and matching fila cap",
    bg: "#EFE6DA",
    dark: false,
    focus: "object-top",
  },
  {
    id: 3,
    title: "Ankara, Lace & Aso Oke, Made for Queens Who Dare",
    offer: "One Continent. One Culture. Many Colours.",
    buttonText1: "Shop Women",
    buttonText2: "See Lookbook",
    imgSrc: assets.header_aso_oke_woman_image,
    imgAlt: "Woman in aso oke iro and buba with matching gele and coral beads",
    bg: "#7E0D10",
    dark: true,
    focus: "object-[center_20%]",
  },
];

const HeaderSlider = () => {
  const { router } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className="relative flex flex-col-reverse md:flex-row md:items-center min-w-full mt-6 rounded-xl overflow-hidden md:h-[440px]"
            style={{ backgroundColor: slide.bg }}
          >
            {/* Text */}
            <div className="relative z-10 md:w-1/2 px-5 md:pl-14 lg:pl-16 pb-8 pt-2 md:py-0">
              <p
                className={`md:text-base text-sm font-medium tracking-wide pb-2 ${
                  slide.dark ? "text-gold-300" : "text-gold-600"
                }`}
              >
                {slide.offer}
              </p>
              <h1
                className={`max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold ${
                  slide.dark ? "text-cream" : "text-forest-700"
                }`}
              >
                {slide.title}
              </h1>
              <div className="flex items-center mt-5 md:mt-7">
                <button
                  onClick={() => router.push("/all-products")}
                  className={`md:px-10 px-7 md:py-2.5 py-2 rounded-full font-medium transition ${
                    slide.dark
                      ? "bg-gold-400 text-forest-900 hover:bg-gold-300"
                      : "bg-forest-600 text-white hover:bg-forest-700"
                  }`}
                >
                  {slide.buttonText1}
                </button>
                <button
                  onClick={() => router.push("/all-products")}
                  className={`group flex items-center gap-2 px-6 py-2.5 font-medium ${
                    slide.dark ? "text-cream" : "text-forest-700"
                  }`}
                >
                  {slide.buttonText2}
                  <Image
                    className="group-hover:translate-x-1 transition"
                    src={slide.dark ? assets.arrow_icon_white : assets.arrow_icon}
                    alt=""
                  />
                </button>
              </div>
            </div>

            {/* Photo: fades out at the bottom on mobile, at the left on desktop */}
            <div className="relative w-full h-80 md:absolute md:inset-y-0 md:right-0 md:w-[55%] md:h-full [mask-image:linear-gradient(to_bottom,black_65%,transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_35%)]">
              <Image
                src={slide.imgSrc}
                alt={slide.imgAlt}
                fill
                sizes="(min-width: 768px) 55vw, 100vw"
                className={`object-cover ${slide.focus}`}
                priority={index === 0}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {sliderData.map((_, index) => (
          <button
            key={index}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              currentSlide === index ? "w-6 bg-forest-600" : "w-2 bg-gray-500/30"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
