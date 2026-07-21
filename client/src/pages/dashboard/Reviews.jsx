import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { LuEllipsisVertical, LuPlus, LuStar, LuX } from "react-icons/lu";
import toast from "react-hot-toast";
import { createReview, deleteReview as deleteReviewApi, getAdminReviews, updateReview as updateReviewApi } from "../../services/api";

const emptyForm = { name: "", car: "", review: "", image: "/man1.png", rating: 5, featured: false, published: true };

function ReviewModal({ review, onClose, onSave }) {
  const [form, setForm] = useState(review || emptyForm);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
      <form onSubmit={(event) => { event.preventDefault(); onSave(form); }} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4B95D1]">Social proof</p><h2 id="review-modal-title" className="mt-1 text-2xl font-bold text-gray-800">{review ? "Edit review" : "Add review"}</h2></div><button type="button" onClick={onClose} aria-label="Close modal" className="rounded-xl p-2 text-gray-400 hover:bg-gray-100"><LuX size={22} /></button></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Customer name"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} /></Field>
          <Field label="Vehicle"><input required value={form.car} onChange={(event) => setForm({ ...form, car: event.target.value })} className={inputClass} /></Field>
          <Field label="Rating"><select value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} className={inputClass}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? "" : "s"}</option>)}</select></Field>
          <Field label="Customer image URL"><input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="/man1.png" className={inputClass} /></Field>
          <label className="block text-sm font-semibold text-gray-700 sm:col-span-2">Review<textarea required rows="5" value={form.review} onChange={(event) => setForm({ ...form, review: event.target.value })} className={`${inputClass} resize-none`} /></label>
        </div>
        <div className="mt-5 flex flex-wrap gap-5 rounded-2xl bg-gray-50 px-4 py-4"><label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-600"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} className="h-4 w-4 accent-[#4B95D1]" /> Published</label><label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-600"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} className="h-4 w-4 accent-violet-500" /> Featured review</label></div>
        <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600">Cancel</button><button type="submit" className="rounded-xl bg-[#4B95D1] px-6 py-3 font-bold text-white">Save review</button></div>
      </form>
    </div>
  );
}

const inputClass = "mt-2 w-full rounded-xl border border-gray-200 bg-[#fbfdff] px-4 py-3 font-normal text-gray-700 outline-none focus:border-[#4B95D1] focus:ring-4 focus:ring-blue-50";
function Field({ label, children }) { return <label className="block text-sm font-semibold text-gray-700">{label}{children}</label>; }

export default function Reviews() {
  const { search = "" } = useOutletContext() || {};
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    getAdminReviews().then((payload) => setReviews(payload.data.map(normalizeReview))).catch((error) => toast.error(error.message)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? reviews.filter((review) => Object.values(review).join(" ").toLowerCase().includes(query)) : reviews;
  }, [reviews, search]);

  const saveReview = async (form) => {
    try {
      if (modal?.mode === "edit") {
        const payload = await updateReviewApi(modal.review.id, form);
        const saved = normalizeReview(payload.data);
        setReviews((current) => current.map((review) => review.id === saved.id ? saved : review));
        toast.success("Review updated successfully.");
      } else {
        const payload = await createReview(form);
        setReviews((current) => [normalizeReview(payload.data), ...current]);
        toast.success(form.published ? "Review published on the website." : "Review saved as hidden.");
      }
      setModal(null);
    } catch (error) { toast.error(error.message); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    try { await deleteReviewApi(id); setReviews((current) => current.filter((review) => review.id !== id)); setActiveMenu(null); toast.success("Review deleted."); } catch (error) { toast.error(error.message); }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4B95D1]">Customer trust</p><h1 className="mt-1 text-3xl font-bold text-gray-800">Reviews</h1><p className="mt-2 text-sm text-gray-500">Control ratings, featured stories and website visibility.</p></div><button type="button" onClick={() => setModal({ mode: "add" })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4B95D1] px-5 py-3 font-bold text-white"><LuPlus /> Add review</button></div>
      <section className="overflow-hidden rounded-3xl bg-white shadow-[0_10px_35px_rgba(30,91,136,0.06)]"><div className="overflow-x-auto"><table className="w-full min-w-[1080px] text-left"><thead><tr className="border-b border-gray-100 bg-slate-50/70 text-xs uppercase tracking-wide text-gray-500">{["Customer", "Vehicle", "Review", "Rating", "Visibility", "Action"].map((heading) => <th key={heading} className="px-6 py-4 font-bold">{heading}</th>)}</tr></thead><tbody>
        {!loading && filtered.map((review, index) => <tr key={review.id} className="border-b border-gray-100 align-top text-sm text-gray-600 last:border-0 hover:bg-blue-50/30"><td className="px-6 py-5"><div className="flex items-center gap-3"><img src={review.image} alt="" className="h-10 w-10 rounded-xl object-cover" /><span className="font-bold text-gray-800">{review.name}</span></div></td><td className="px-6 py-5">{review.car}</td><td className="max-w-md px-6 py-5 leading-6">{review.review}</td><td className="px-6 py-5"><span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-600"><LuStar className="fill-current" /> {review.rating}</span></td><td className="px-6 py-5"><span className={`rounded-full px-3 py-1 text-xs font-bold ${review.published ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>{review.published ? (review.featured ? "Featured" : "Published") : "Hidden"}</span></td><td className="relative px-6 py-5"><button type="button" onClick={() => setActiveMenu(activeMenu === review.id ? null : review.id)} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Review actions"><LuEllipsisVertical /></button>{activeMenu === review.id && <div className={`absolute right-14 z-40 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl ${index >= filtered.length - 2 ? "bottom-10" : "top-12"}`}><button type="button" onClick={() => { setModal({ mode: "edit", review }); setActiveMenu(null); }} className="block w-full px-4 py-2.5 text-left hover:bg-gray-50">Edit</button><button type="button" onClick={() => remove(review.id)} className="block w-full px-4 py-2.5 text-left text-red-500 hover:bg-red-50">Delete</button></div>}</td></tr>)}
        {loading && <tr><td colSpan="6" className="px-7 py-14 text-center text-gray-500">Loading reviews...</td></tr>}{!loading && filtered.length === 0 && <tr><td colSpan="6" className="px-7 py-14 text-center text-gray-500">No reviews found.</td></tr>}
      </tbody></table></div></section>
      {modal && <ReviewModal review={modal.mode === "edit" ? modal.review : null} onClose={() => setModal(null)} onSave={saveReview} />}
    </div>
  );
}

function normalizeReview(review) {
  return { id: review._id, name: review.name, car: review.car, review: review.review, image: review.image || "/man1.png", rating: review.rating || 5, featured: Boolean(review.featured), published: review.published !== false };
}
