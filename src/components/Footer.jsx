import React from 'react';
import logo from '../assets/BARBYlogo.png';
import mercadopago from '../assets/mercado-pago.svg';
import facebook from '../assets/facebook-white.png';
import instagram from '../assets/instagram-white.png';
import whatsapp from '../assets/whatsapp-white.png';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-6 font-body">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 items-start text-sm">

        {/* Logo */}
        <div className="flex justify-center md:justify-start">
          <img src={logo} alt="Logo tienda" className="h-20 md:h-28" />
        </div>

        {/* Redes */}
        <nav
          aria-label="Redes Sociales"
          className="flex flex-col items-center md:items-start gap-3"
        >
          <p className="font-semibold text-gray-200 text-base md:text-lg">
            Seguinos
          </p>

          <div className="flex gap-4">
            {[
              {
                href: "https://wa.me/+5491164283906",
                alt: "WhatsApp",
                src: whatsapp,
              },
              {
                href: "https://www.instagram.com/barby_indu/",
                alt: "Instagram",
                src: instagram,
              },
              {
                href: "https://www.facebook.com/barbara.andrada",
                alt: "Facebook",
                src: facebook,
              },
            ].map(({ href, alt, src }) => (
              <a
                key={alt}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={alt}
                className="transition duration-300 hover:brightness-125 hover:drop-shadow-[0_0_6px_rgba(236,72,153,0.8)]"
              >
                <img
                  src={src}
                  alt={alt}
                  className="w-6 h-6 transition-transform duration-300 hover:scale-110"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.9))',
                  }}
                />
              </a>
            ))}
          </div>
        </nav>

        {/* Contacto */}
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <p className="font-semibold text-gray-200 text-base md:text-lg">
            Contacto
          </p>

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=barbytienda30@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 hover:underline transition"
          >
            barbytienda30@gmail.com
          </a>

          <a
            href="https://wa.me/+5491164283906"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 hover:underline transition"
          >
            +54 9 11 6428-3906
          </a>
        </div>

        {/* Formas de pago */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <p className="font-semibold text-gray-200 text-base md:text-lg">
            Formas de pago
          </p>
          <span>Transferencia / Mercado Pago</span>
          <img src={mercadopago} alt="Mercado Pago" className="h-10" />
        </div>
      </div>

      {/* Copyright + Firma */}
      <div className="mt-10 text-center text-xs text-gray-400">
        <p>
          © {new Date().getFullYear()} Barby Indumentaria. Todos los derechos reservados.
        </p>

        {/* FIRMA SHIMMER FUCSIA */}
        <p
          className="
            mt-4
            font-body font-extralight tracking-widest
            text-base leading-tight
            sm:text-xl sm:leading-normal
            bg-clip-text text-transparent
          "
          style={{
            backgroundImage:
              'linear-gradient(135deg, #f9a8d4 0%, #ec4899 25%, #d946ef 50%, #ec4899 75%, #f9a8d4 100%)',
            backgroundSize: '200% 200%',
            animation: 'shimmer 3s infinite linear',
            filter: 'drop-shadow(0 0 12px rgba(236,72,153,0.9))',
          }}
        >
          Diseñado por{' '}
          <span className="inline-block align-middle">
            &lt;/CodeMoon🌙&gt;
          </span>
        </p>
      </div>
    </footer>
  );
}