import React from "react";
import logo from "../assets/BARBYlogo.png";
import { useFrontendSettings } from "../context/FrontendSettingsContext";

export default function Hero() {
  const { settings } = useFrontendSettings();
  const { bannerUrl, bannerBlur, cintaTexto, cintaVisible } = settings;

  return (
    <section className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] lg:h-[520px] overflow-hidden bg-pink-100 overflow-x-hidden">

      {/* BANNER */}
      {bannerUrl && (
        <img
          src={bannerUrl}
          alt="Banner"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* BLUR COSTADOS */}
      {bannerBlur && bannerUrl && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-white/40 backdrop-blur-md z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-white/40 backdrop-blur-md z-10" />
        </>
      )}

      {/* CONTENIDO */}
      <div className="relative z-20 flex h-full px-6 items-start">
        <img
          src={logo}
          alt="Logo Tienda Barby"
          className="
            h-28 sm:h-48 md:h-56 drop-shadow-lg
            mt-10 sm:mt-8 md:mt-8
            ml-2 sm:ml-6 md:ml-6
          "
        />
      </div>
{/* CINTA INFINITA */}
{cintaVisible && cintaTexto && (
  <div className="absolute bottom-0 left-0 w-full overflow-hidden bg-pink-400/50 backdrop-blur-sm py-2">
    <div className="flex w-max animate-marquee">
      <span className="flex-shrink-0 px-20 whitespace-pre">
        {cintaTexto}
      </span>
      <span className="flex-shrink-0 px-20 whitespace-pre">
        {cintaTexto}
      </span>
    </div>
  </div>
)}
</section>    
  );
}