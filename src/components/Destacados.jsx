import { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';

function Destacados() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(
          "https://tiendamoda-production-280c.up.railway.app/api/v1/products?destacados=true&limit=6"
        );
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        setProductos(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
        console.error('❌ Error al cargar productos:', err);
        setError('No pudimos cargar los productos destacados.');
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
    return () => setProductos([]);
  }, []);

  const renderSkeletons = () =>
    Array(6)
      .fill(0)
      .map((_, i) => (
        <SwiperSlide key={`skeleton-${i}`}>
          <div className="bg-white rounded-2xl shadow-md animate-pulse h-72 sm:h-96 flex flex-col p-5">
            <div className="h-40 sm:h-60 bg-gray-200 rounded-2xl mb-4"></div>
            <div className="flex flex-col flex-grow justify-between">
              <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="mt-4 h-10 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        </SwiperSlide>
      ));

  if (error) return <p className="text-center py-10 text-red-600">{error}</p>;
  if (!loading && !productos.length)
    return <p className="text-center py-10">No hay productos destacados disponibles.</p>;

  return (
    <section className="bg-pink-100 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-black mb-10 text-center tracking-wide">
          Productos Destacados
        </h2>

        <Swiper
          modules={[Autoplay]}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={productos.length > 1}
          spaceBetween={20}
          slidesPerView={1.1}
          breakpoints={{
            640: { slidesPerView: 1.3 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {loading
            ? renderSkeletons()
            : productos.map((prod, idx) => {
                const precioFormateado = Number(prod.precio || 0).toLocaleString('es-AR');
                const isActive = idx === activeIndex;

                return (
                  <SwiperSlide key={prod.id}>
                    <Link to={`/producto/${prod.id}`}>
                      <div
                        className={`bg-white rounded-2xl shadow-md transition-all duration-500 overflow-hidden h-full flex flex-col transform
                          ${isActive ? 'scale-105' : 'scale-95 opacity-70'}`}
                      >
                        <div className="h-40 sm:h-60 flex items-center justify-center overflow-hidden rounded-2xl">
                          <img
                            src={prod.imageUrl || '/placeholder.png'}
                            alt={prod.nombre}
                            className="object-contain w-full h-full p-6 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                          />
                        </div>
                        <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
                          <h3 className="text-base sm:text-lg font-body font-semibold text-black mb-2 line-clamp-2">
                            {prod.nombre}
                          </h3>
                          <div className="flex justify-between items-center mt-auto">
                            <p className="text-pink-600 text-lg sm:text-xl font-body font-semibold">
                              ${precioFormateado}
                            </p>
                            {prod.estado === "activo" ? (
                              <p
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-sm font-body font-semibold shadow-lg transition
                                  bg-black text-white hover:bg-pink-600 text-center cursor-pointer"
                              >
                                Ver producto
                              </p>
                            ) : (
                              <span className="text-gray-400 italic text-sm">
                                Disponible próximamente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
        </Swiper>
      </div>
    </section>
  );
}

export default Destacados;