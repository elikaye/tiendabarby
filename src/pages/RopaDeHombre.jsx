import React, { useEffect, useState, useRef } from "react";
import ProductoCard from "../components/ProductoCard";
import { API_BASE_URL, CLOUDINARY_BASE_URL } from "../config";

let io = null;
try { io = require("socket.io-client"); } catch(e){ io = null; }

function normalizarCategoria(catRaw){
  if(!catRaw) return "otros";
  const cat = catRaw.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  if(cat.includes("mujer") || cat.includes("dama") || cat.includes("femen")) return "ropa-dama";
  if(cat.includes("hombre") || cat.includes("varon") || cat.includes("caballero")) return "ropa-hombre";
  return "otros";
}

const chunkArray = (arr, chunkSize) => {
  const result = [];
  for(let i=0;i<arr.length;i+=chunkSize){
    result.push(arr.slice(i,i+chunkSize));
  }
  return result;
};

export default function RopaDeHombre(){
  const [productos,setProductos] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);

  const rawRef = useRef([]);
  const socketRef = useRef(null);

  const mezclarBalanceado = (lista)=>{
    const grupos={};
    lista.forEach(p=>{if(!grupos[p.categoria]) grupos[p.categoria]=[]; grupos[p.categoria].push(p)});
    const resultado=[];
    let restos=true;
    const categorias=Object.keys(grupos);
    while(restos){
      restos=false;
      const orden=[...categorias].sort(()=>Math.random()-0.5);
      for(const cat of orden){
        if(grupos[cat].length>0){ resultado.push(grupos[cat].shift()); restos=true; }
      }
    }
    return resultado;
  };

  const fetchProductos = async()=>{
    setLoading(true);
    try{
      const res = await fetch(`${API_BASE_URL}/products`);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const prods = (data.products || []).map(p=>({
        ...p,
        id:p.id||p._id,
        categoria: normalizarCategoria(p.categoria),
        precio: parseFloat(p.precio)||0,
        imageUrl: p.imageUrl && !p.imageUrl.startsWith("http") ? `${CLOUDINARY_BASE_URL}${p.imageUrl}` : p.imageUrl
      }));
      rawRef.current = prods.filter(p=>p.categoria==="ropa-hombre");
      setProductos(mezclarBalanceado(rawRef.current));
      setError(null);
    }catch(err){
      console.error(err);
      setError("No se pudieron cargar los productos de ropa de hombre.");
      setProductos([]);
    }finally{ setLoading(false); }
  };

  useEffect(()=>{
    fetchProductos();
    let socketClient=null;
    try{
      if(io){ socketClient=io.connect(window.location.origin); socketRef.current=socketClient; socketClient.on("productos:changed",fetchProductos); }
    }catch{}
    return ()=>{ if(socketRef.current) socketRef.current.disconnect(); };
  },[]);

  const COLUMNAS_MOBILE = 4;

  return (
    <section className="min-h-screen py-20 px-6 bg-gradient-to-br from-pink-100 via-white to-pink-200 font-body">
      <div className="max-w-7xl mx-auto">

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array(COLUMNAS_MOBILE*2).fill(0).map((_,i)=>
              <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
            )}
          </div>
        ) : error ? (
          <p className="text-center text-red-600 py-10">{error}</p>
        ) : productos.length>0 ? (
          <>
            {/* MOBILE */}
            <div className="sm:hidden space-y-4">
              {chunkArray(productos, COLUMNAS_MOBILE).map((filaProductos,index)=>(
                <div
                  key={index}
                  className="flex space-x-4 overflow-x-auto pb-2"
                  style={{ scrollSnapType: "x mandatory" }}
                >
                  {filaProductos.map(p=>(
                    <div key={p.id} className="flex-shrink-0 w-64" style={{ scrollSnapAlign: "start" }}>
                      <ProductoCard producto={p}/>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* DESKTOP */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {productos.map(p=><ProductoCard key={p.id} producto={p}/>)}
            </div>
          </>
        ) : (
          <p className="text-gray-600 text-center">No hay productos disponibles en esta sección por el momento.</p>
        )}
      </div>
    </section>
  );
}