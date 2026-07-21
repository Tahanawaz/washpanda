import { useEffect, useState } from "react";
import { getGallery } from "../../../services/api";

export default function Gallery() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    getGallery().then((payload) => { if (active) setItems(payload.data); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  if (items.length === 0) return null;

  return (
    <section id="gallery" className="overflow-hidden bg-white pb-10 pt-8">
      <div className="w-full">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-[#4B95D1]">Before & after</p>
        <h2 className="mt-3 text-center text-3xl font-extrabold text-[#222] sm:text-4xl">Our Recent Work</h2>
        <div className="mt-10 overflow-hidden py-4">
          <div className="gallery-track flex w-max gap-4 px-2">
            {[...items, ...items].map((item, index) => (
              <article key={`${item._id}-${index}`} className="group relative h-[340px] w-[220px] shrink-0 overflow-hidden rounded-3xl bg-[#eef5fb] shadow-sm transition-[width,transform,box-shadow] duration-500 ease-out hover:z-10 hover:w-[310px] hover:-translate-y-2 hover:shadow-xl sm:h-[430px] sm:w-[250px] sm:hover:w-[380px]">
                <img src={item.src} alt={item.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                <div className="absolute bottom-7 left-7 translate-y-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"><h3 className="text-xl font-bold text-white">{item.title}</h3></div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
