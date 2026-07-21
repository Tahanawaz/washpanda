import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuBuilding2, LuCreditCard, LuGlobe, LuSave } from "react-icons/lu";
import { getAdminSiteSettings, updateSiteSettings } from "../../services/api";

export default function WebsiteSettings() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminSiteSettings()
      .then((payload) => setSettings(payload.data))
      .catch((error) => toast.error(error.message));
  }, []);

  const updateField = (name, value) => setSettings((current) => ({ ...current, [name]: value }));
  const updatePayment = (index, changes) => setSettings((current) => ({
    ...current,
    paymentMethods: current.paymentMethods.map((method, methodIndex) => methodIndex === index ? { ...method, ...changes } : method),
  }));

  const save = async (event) => {
    event.preventDefault();
    const invalidPayment = settings.paymentMethods.find((method) => method.id !== "cash" && method.enabled && !method.accountNumber.trim() && !method.paymentUrl.trim());
    if (invalidPayment) {
      toast.error(`${invalidPayment.label} needs an account number or secure payment URL.`);
      return;
    }
    setSaving(true);
    try {
      const payload = await updateSiteSettings(settings);
      setSettings(payload.data);
      toast.success("Website settings updated successfully.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="rounded-3xl bg-white p-12 text-center text-gray-500">Loading website settings...</div>;

  return (
    <form onSubmit={save} className="space-y-6 pb-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-[#edf7fe] to-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#4B95D1]"><LuGlobe /> Website control</p><h1 className="mt-2 text-3xl font-bold text-gray-800">Website settings</h1><p className="mt-2 text-sm text-gray-500">Contact details, business information and customer payment options.</p></div>
        <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4B95D1] px-5 py-3 font-bold text-white shadow-lg shadow-blue-100 disabled:opacity-60"><LuSave /> {saving ? "Saving..." : "Save settings"}</button>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-[0_10px_35px_rgba(30,91,136,0.06)] sm:p-7">
        <div className="mb-6 flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-3 text-[#4B95D1]"><LuBuilding2 size={22} /></span><div><h2 className="text-xl font-bold text-gray-800">Business information</h2><p className="text-sm text-gray-400">Shown in the website header, footer and receipt.</p></div></div>
        <div className="grid gap-5 md:grid-cols-2">
          <SettingField label="Business name" value={settings.businessName} onChange={(value) => updateField("businessName", value)} />
          <SettingField label="Phone number" value={settings.phone} onChange={(value) => updateField("phone", value)} />
          <SettingField label="Email address" type="email" value={settings.email} onChange={(value) => updateField("email", value)} />
          <SettingField label="Business hours" value={settings.businessHours} onChange={(value) => updateField("businessHours", value)} />
          <SettingField label="Address" value={settings.address} onChange={(value) => updateField("address", value)} className="md:col-span-2" />
          <SettingField label="Facebook URL" value={settings.facebook} onChange={(value) => updateField("facebook", value)} />
          <SettingField label="Instagram URL" value={settings.instagram} onChange={(value) => updateField("instagram", value)} />
          <SettingField label="X / Twitter URL" value={settings.twitter} onChange={(value) => updateField("twitter", value)} />
          <SettingField label="Currency" value={settings.currency} onChange={(value) => updateField("currency", value)} />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-[0_10px_35px_rgba(30,91,136,0.06)] sm:p-7">
        <div className="mb-6 flex items-center gap-3"><span className="rounded-xl bg-violet-50 p-3 text-violet-600"><LuCreditCard size={22} /></span><div><h2 className="text-xl font-bold text-gray-800">Payment methods</h2><p className="text-sm text-gray-400">Enable only the options customers can currently use.</p></div></div>
        <div className="grid gap-4 xl:grid-cols-2">
          {settings.paymentMethods.map((method, index) => (
            <article key={method.id} className={`rounded-2xl border p-5 ${method.enabled ? "border-blue-100" : "border-gray-200 bg-gray-50/70"}`}>
              <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">{method.id}</p><h3 className="mt-1 font-bold text-gray-800">{method.label}</h3></div><label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-500"><input type="checkbox" checked={method.enabled} onChange={(event) => updatePayment(index, { enabled: event.target.checked })} className="h-4 w-4 accent-[#4B95D1]" /> Enabled</label></div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <SettingField label="Display label" value={method.label} onChange={(value) => updatePayment(index, { label: value })} />
                <SettingField label="Account title" value={method.accountTitle} onChange={(value) => updatePayment(index, { accountTitle: value })} />
                <SettingField label="Account / wallet number" value={method.accountNumber} onChange={(value) => updatePayment(index, { accountNumber: value })} />
                <SettingField label="Secure payment URL" type="url" value={method.paymentUrl} onChange={(value) => updatePayment(index, { paymentUrl: value })} />
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 sm:col-span-2">Customer instructions<textarea rows="3" value={method.instructions} onChange={(event) => updatePayment(index, { instructions: event.target.value })} className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-[#fbfdff] px-4 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#4B95D1] focus:ring-4 focus:ring-blue-50" /></label>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">JazzCash, Easypaisa and bank transfers can use manual transaction references now. Automatic payment confirmation requires the selected provider’s merchant API credentials and callback URL.</p>
      </section>
    </form>
  );
}

function SettingField({ label, value = "", onChange, type = "text", className = "" }) {
  return <label className={`block text-xs font-bold uppercase tracking-wide text-gray-500 ${className}`}>{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-[#fbfdff] px-4 py-3 text-sm font-normal normal-case tracking-normal text-gray-700 outline-none focus:border-[#4B95D1] focus:ring-4 focus:ring-blue-50" /></label>;
}
