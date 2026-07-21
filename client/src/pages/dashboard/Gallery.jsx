import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import { LuEye, LuEyeOff, LuImagePlus, LuTrash2, LuUpload, LuX } from "react-icons/lu";
import { createGalleryMedia, deleteGalleryMedia, getAdminGallery, updateGalleryMedia } from "../../services/api";

const MAX_MEDIA_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1800;

function optimizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read this image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("This image could not be processed."));
      image.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function AddMediaModal({ onClose, onAdded }) {
  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error("Please choose a JPG, PNG or WebP image.");
    if (file.size > MAX_MEDIA_SIZE) return toast.error("Gallery image must be 5 MB or smaller.");
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    try {
      setPreview(await optimizeImage(file));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!preview) return;
    setSaving(true);
    try {
      const payload = await createGalleryMedia({ title: title.trim(), src: preview, type: "image", published: true });
      onAdded(payload.data);
      toast.success("Image published on the website.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="add-media-title">
      <form onSubmit={submit} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4B95D1]">Gallery manager</p><h2 id="add-media-title" className="mt-1 text-2xl font-bold text-gray-800">Add new image</h2></div>
          <button type="button" onClick={onClose} aria-label="Close modal" className="rounded-xl p-2 text-gray-400 hover:bg-gray-100"><LuX size={22} /></button>
        </div>
        <label className="mt-6 block text-sm font-semibold text-gray-700">Image title<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4B95D1] focus:ring-4 focus:ring-blue-50" /></label>
        <label className="mt-5 flex min-h-60 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 text-center hover:border-[#4B95D1]">
          {preview ? <img src={preview} alt="Upload preview" className="h-64 w-full object-cover" /> : <span className="p-8 text-sm text-gray-500"><LuUpload size={38} className="mx-auto mb-3 text-[#4B95D1]" />Choose JPG, PNG or WebP<br /><small className="text-gray-400">Maximum 5 MB</small></span>}
          <input type="file" accept="image/*" onChange={chooseFile} className="sr-only" />
        </label>
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600">Cancel</button><button type="submit" disabled={!preview || saving} className="rounded-xl bg-[#4B95D1] px-6 py-3 font-bold text-white disabled:opacity-50">{saving ? "Publishing..." : "Publish image"}</button></div>
      </form>
    </div>
  );
}

export default function Gallery() {
  const { search = "" } = useOutletContext() || {};
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getAdminGallery()
      .then((payload) => setMedia(payload.data))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? media.filter((item) => item.title.toLowerCase().includes(query)) : media;
  }, [media, search]);

  const togglePublished = async (item) => {
    try {
      const payload = await updateGalleryMedia(item._id, { published: !item.published });
      setMedia((current) => current.map((entry) => entry._id === item._id ? payload.data : entry));
      toast.success(payload.data.published ? "Image is visible on the website." : "Image hidden from the website.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete “${item.title}” permanently?`)) return;
    try {
      await deleteGalleryMedia(item._id);
      setMedia((current) => current.filter((entry) => entry._id !== item._id));
      toast.success("Gallery image deleted.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4B95D1]">Visual showcase</p><h1 className="mt-1 text-3xl font-bold text-gray-800">Gallery management</h1><p className="mt-2 text-sm text-gray-500">Upload once and control exactly what customers see.</p></div>
        <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4B95D1] px-5 py-3 font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-600"><LuImagePlus size={20} /> Add image</button>
      </div>

      {loading ? <div className="rounded-3xl bg-white p-14 text-center text-gray-500">Loading gallery...</div> : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((item) => (
            <article key={item._id} className="group overflow-hidden rounded-3xl bg-white shadow-[0_10px_35px_rgba(30,91,136,0.08)]">
              <div className="relative h-64 overflow-hidden bg-slate-100"><img src={item.src} alt={item.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold backdrop-blur ${item.published ? "bg-emerald-500/90 text-white" : "bg-slate-900/75 text-white"}`}>{item.published ? "Published" : "Hidden"}</span></div>
              <div className="flex items-center justify-between gap-3 p-4"><div className="min-w-0"><h2 className="truncate font-bold text-gray-800">{item.title}</h2><p className="mt-1 text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString("en-GB")}</p></div><div className="flex gap-1"><button type="button" onClick={() => togglePublished(item)} aria-label={item.published ? "Hide image" : "Publish image"} className="rounded-xl p-2.5 text-[#4B95D1] hover:bg-blue-50">{item.published ? <LuEye size={18} /> : <LuEyeOff size={18} />}</button><button type="button" onClick={() => remove(item)} aria-label="Delete image" className="rounded-xl p-2.5 text-red-400 hover:bg-red-50"><LuTrash2 size={18} /></button></div></div>
            </article>
          ))}
          {filtered.length === 0 && <div className="col-span-full rounded-3xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-400">No gallery images found.</div>}
        </section>
      )}

      {modalOpen && <AddMediaModal onClose={() => setModalOpen(false)} onAdded={(item) => { setMedia((current) => [item, ...current]); setModalOpen(false); }} />}
    </div>
  );
}
