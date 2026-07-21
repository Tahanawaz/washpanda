import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { LuArrowLeft, LuLockKeyhole, LuMail, LuPhone, LuShieldCheck, LuUser } from "react-icons/lu";
import { setupAdmin } from "../services/api";
import { saveAdminProfile } from "../services/adminProfileStorage";

export default function SetupAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("password") !== form.get("confirmPassword")) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = await setupAdmin({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
      });
      saveAdminProfile(payload.data);
      toast.success("Admin account created. Password authentication is now active.");
      navigate("/dashboard/profile", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef5fa] px-5 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(75,149,209,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,74,122,0.16),transparent_32%)]" />
      <section className="relative z-10 w-full max-w-[560px] rounded-[32px] border border-white/90 bg-white/95 p-6 shadow-[0_30px_90px_rgba(31,87,130,0.18)] sm:p-10">
        <div className="text-center">
          <img src="/logo.png" alt="Wash Panda" className="mx-auto h-20 w-24 object-contain" />
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#4B95D1]"><LuShieldCheck /> One-time setup</span>
          <h1 className="mt-4 text-3xl font-bold text-[#172b3b]">Create admin account</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">After saving these details, password authentication will be permanently enabled.</p>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

        <form onSubmit={submit} className="mt-7 grid gap-5 sm:grid-cols-2">
          <SetupField icon={LuUser} label="Admin name" name="name" placeholder="Enter full name" />
          <SetupField icon={LuPhone} label="Phone number" name="phone" type="tel" placeholder="+923001234567" pattern="^\+[1-9]\d{7,14}$" />
          <SetupField icon={LuMail} label="Email address" name="email" type="email" placeholder="admin@washpanda.com" className="sm:col-span-2" />
          <SetupField icon={LuLockKeyhole} label="Password" name="password" type="password" placeholder="Minimum 8 characters" minLength="8" />
          <SetupField icon={LuLockKeyhole} label="Confirm password" name="confirmPassword" type="password" placeholder="Enter password again" minLength="8" />
          <button type="submit" disabled={loading} className="rounded-xl bg-[#4B95D1] px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-600 disabled:cursor-wait disabled:opacity-60 sm:col-span-2">{loading ? "Creating account..." : "Save & Enable Authentication"}</button>
        </form>

        <Link to="/login" className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#4B95D1]"><LuArrowLeft /> Back to login</Link>
      </section>
    </main>
  );
}

function SetupField({ icon: Icon, label, name, className = "", type = "text", ...props }) {
  return (
    <label htmlFor={`setup-${name}`} className={`block text-sm font-semibold text-gray-700 ${className}`}>
      {label}
      <span className="relative mt-2 block">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75a6cb]" size={18} />
        <input id={`setup-${name}`} name={name} type={type} required {...props} className="w-full rounded-xl border border-gray-200 bg-[#f8fbfd] py-3 pl-11 pr-4 font-normal outline-none focus:border-[#4B95D1] focus:ring-4 focus:ring-blue-100/70" />
      </span>
    </label>
  );
}
