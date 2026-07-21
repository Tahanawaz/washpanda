import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuClock3, LuImagePlus, LuPackage, LuPlus, LuSave, LuSparkles, LuTrash2, LuTruck } from "react-icons/lu";
import { getAdminCatalog, updateCatalog } from "../../services/api";

const tabs = [
  { id: "packages", label: "Packages", icon: LuPackage },
  { id: "vehicles", label: "Vehicles", icon: LuTruck },
  { id: "addons", label: "Add-ons", icon: LuSparkles },
  { id: "timeSlots", label: "Time slots", icon: LuClock3 },
];

const templates = {
  packages: { name: "New Package", price: 0, features: ["New service feature"], featured: false, active: true },
  vehicles: { name: "New Vehicle", image: "/Sedan.png", surcharge: 0, active: true },
  addons: { name: "New Add-on", price: 0, active: true },
  timeSlots: { label: "New Slot", time: "9am to 12pm", capacity: 4, active: true },
};

const MAX_VEHICLE_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VEHICLE_IMAGE_EDGE = 1200;

function optimizeVehicleImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read this vehicle image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("This vehicle image could not be processed."));
      image.onload = () => {
        const scale = Math.min(1, MAX_VEHICLE_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function Packages() {
  const [catalog, setCatalog] = useState({ packages: [], vehicles: [], addons: [], timeSlots: [] });
  const [activeTab, setActiveTab] = useState("packages");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminCatalog()
      .then((payload) => setCatalog(pickCatalog(payload.data)))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  const updateItem = (section, index, changes) => {
    setCatalog((current) => ({
      ...current,
      [section]: current[section].map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item),
    }));
  };

  const addItem = () => {
    setCatalog((current) => ({ ...current, [activeTab]: [...current[activeTab], { ...templates[activeTab] }] }));
  };

  const removeItem = (section, index) => {
    setCatalog((current) => ({ ...current, [section]: current[section].filter((_, itemIndex) => itemIndex !== index) }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = await updateCatalog(catalog);
      setCatalog(pickCatalog(payload.data));
      toast.success("Service catalog updated across the website.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-3xl bg-white p-12 text-center text-gray-500">Loading service catalog...</div>;

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#12344d] via-[#174b70] to-[#287fbd] p-6 text-white shadow-xl shadow-blue-100 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Service catalog</p>
          <h1 className="mt-2 text-3xl font-bold">Packages & availability</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">One clean control center for website prices, vehicles, add-ons and bookable time slots.</p>
        </div>
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-[#236fa6] shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60">
          <LuSave size={19} /> {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex min-w-max items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === id ? "bg-[#e9f4fc] text-[#287fbd]" : "text-gray-500 hover:bg-gray-50"}`}>
            <Icon size={18} /> {label} <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-400">{catalog[id].length}</span>
          </button>
        ))}
      </div>

      <section className="rounded-3xl bg-white p-4 shadow-[0_10px_35px_rgba(30,91,136,0.06)] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
            <p className="mt-1 text-sm text-gray-400">Disabled items stay saved but disappear from customer pages.</p>
          </div>
          <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-xl bg-[#4B95D1] px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-600"><LuPlus /> Add new</button>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {catalog[activeTab].map((item, index) => (
            <CatalogCard key={item._id || `${activeTab}-${index}`} section={activeTab} item={item} index={index} onChange={updateItem} onRemove={removeItem} />
          ))}
        </div>

        {catalog[activeTab].length === 0 && <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center text-sm text-gray-400">No items yet. Add your first one.</div>}
      </section>
    </div>
  );
}

function CatalogCard({ section, item, index, onChange, onRemove }) {
  const fieldClass = "mt-1.5 w-full rounded-xl border border-gray-200 bg-[#fbfdff] px-3 py-2.5 text-sm outline-none transition focus:border-[#4B95D1] focus:ring-4 focus:ring-blue-50";
  const chooseVehicleImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return toast.error("Choose a JPG, PNG or WebP vehicle image.");
    if (file.size > MAX_VEHICLE_IMAGE_SIZE) return toast.error("Vehicle image must be 5 MB or smaller.");
    const toastId = toast.loading("Optimizing vehicle image...");
    try {
      const image = await optimizeVehicleImage(file);
      onChange(section, index, { image });
      toast.success("Vehicle image selected. Save changes to publish it.", { id: toastId });
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };
  return (
    <article className={`rounded-2xl border p-4 transition sm:p-5 ${item.active ? "border-blue-100 bg-white" : "border-gray-200 bg-gray-50/70 opacity-75"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#4B95D1]">#{index + 1}</span>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-500"><input type="checkbox" checked={item.active !== false} onChange={(event) => onChange(section, index, { active: event.target.checked })} className="h-4 w-4 accent-[#4B95D1]" /> Active</label>
          <button type="button" onClick={() => onRemove(section, index)} aria-label="Remove item" className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600"><LuTrash2 size={17} /></button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {section === "timeSlots" ? (
          <>
            <Field label="Slot label"><input value={item.label} onChange={(event) => onChange(section, index, { label: event.target.value })} className={fieldClass} /></Field>
            <Field label="Time range"><input value={item.time} onChange={(event) => onChange(section, index, { time: event.target.value })} className={fieldClass} /></Field>
            <Field label="Booking capacity"><input type="number" min="1" max="100" value={item.capacity} onChange={(event) => onChange(section, index, { capacity: Number(event.target.value) })} className={fieldClass} /></Field>
          </>
        ) : (
          <>
            <Field label={section === "vehicles" ? "Vehicle name" : section === "addons" ? "Add-on name" : "Package name"}>
              <input value={item.name} onChange={(event) => onChange(section, index, { name: event.target.value })} className={fieldClass} />
            </Field>
            {section === "vehicles" && <Field label="Vehicle surcharge"><input type="number" min="0" value={item.surcharge} onChange={(event) => onChange(section, index, { surcharge: Number(event.target.value) })} className={fieldClass} /></Field>}
            {section !== "vehicles" && <Field label="Price"><input type="number" min="0" value={item.price} onChange={(event) => onChange(section, index, { price: Number(event.target.value) })} className={fieldClass} /></Field>}
          </>
        )}
      </div>

      {section === "vehicles" && (
        <div className="mt-4 grid items-center gap-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-4 sm:grid-cols-[112px_1fr]">
          <div className="flex h-24 w-28 items-center justify-center overflow-hidden rounded-xl border border-white bg-white p-2 shadow-sm">
            <img src={item.image || "/Sedan.png"} alt={`${item.name || "Vehicle"} preview`} className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">Vehicle picture</p>
            <p className="mt-1 text-xs leading-5 text-gray-400">Select an image directly from your laptop gallery. It will be optimized automatically.</p>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#4B95D1] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600">
              <LuImagePlus size={18} /> Choose from gallery
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseVehicleImage} className="sr-only" />
            </label>
            <span className="ml-3 text-[11px] text-gray-400">JPG, PNG or WebP · Max 5 MB</span>
          </div>
        </div>
      )}

      {section === "packages" && (
        <div className="mt-4">
          <Field label="Features (one per line)"><textarea rows="5" value={(item.features || []).join("\n")} onChange={(event) => onChange(section, index, { features: event.target.value.split("\n").filter(Boolean) })} className={`${fieldClass} resize-none`} /></Field>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-600"><input type="checkbox" checked={Boolean(item.featured)} onChange={(event) => onChange(section, index, { featured: event.target.checked })} className="h-4 w-4 accent-violet-500" /> Highlight as recommended package</label>
        </div>
      )}
    </article>
  );
}

function Field({ label, children }) {
  return <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">{label}{children}</label>;
}

function pickCatalog(data) {
  return {
    packages: data.packages || [],
    vehicles: data.vehicles || [],
    addons: data.addons || [],
    timeSlots: data.timeSlots || [],
  };
}
