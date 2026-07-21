import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LuArrowLeft, LuEye, LuEyeOff, LuKeyRound, LuLockKeyhole, LuMail, LuMessageSquareText, LuPhone, LuShieldCheck } from "react-icons/lu";
import { getAdminSetupStatus, loginAdmin, requestPasswordCode, resetAdminPassword, verifyPasswordCode } from "../services/api";
import { saveAdminProfile } from "../services/adminProfileStorage";

const copy = {
  login: ["Welcome back", "Sign in with your registered admin credentials."],
  phone: ["Forgot password?", "Enter the phone number saved in your admin profile."],
  code: ["Verify SMS code", "Enter the verification code sent to your phone."],
  reset: ["Create new password", "Choose a strong password for your admin account."],
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    getAdminSetupStatus()
      .then((payload) => setSetupRequired(payload.setupRequired))
      .catch(() => setSetupRequired(false));
  }, []);

  const run = async (action) => {
    setLoading(true);
    setError("");
    try {
      await action();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const login = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    run(async () => {
      const remember = form.get("remember") === "on";
      const payload = await loginAdmin({ email: form.get("email"), password: form.get("password"), remember });
      saveAdminProfile(payload.data);
      toast.success("Welcome back. Login successful.");
      navigate(location.state?.from || "/dashboard", { replace: true });
    });
  };

  const sendCode = (event) => {
    event.preventDefault();
    run(async () => {
      await requestPasswordCode(phone);
      toast.success("Verification code sent by SMS.");
      setMode("code");
    });
  };

  const verifyCode = (event) => {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get("code");
    run(async () => {
      const payload = await verifyPasswordCode(phone, code);
      setResetToken(payload.resetToken);
      setMode("reset");
    });
  };

  const resetPassword = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newPassword = form.get("newPassword");
    if (newPassword !== form.get("confirmPassword")) {
      setError("Passwords do not match");
      return;
    }
    run(async () => {
      await resetAdminPassword(phone, resetToken, newPassword);
      toast.success("Password updated. You can sign in now.");
      setMode("login");
      setPhone("");
      setResetToken("");
    });
  };

  const goBack = () => {
    setError("");
    setMode(mode === "reset" ? "code" : mode === "code" ? "phone" : "login");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef5fa] px-5 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(75,149,209,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,74,122,0.15),transparent_32%)]" />
      <span className="absolute -left-24 top-16 h-72 w-72 rounded-full border-[45px] border-white/45" />
      <span className="absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-[#4B95D1]/10" />

      <Link to="/" className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-xl bg-white/75 px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm backdrop-blur hover:text-[#4B95D1] sm:left-8 sm:top-8">
        <LuArrowLeft /> Back to website
      </Link>

      <section className="relative z-10 w-full max-w-[470px] rounded-[32px] border border-white/90 bg-white/90 px-6 pb-8 pt-7 shadow-[0_30px_90px_rgba(31,87,130,0.18)] backdrop-blur-xl sm:px-10 sm:pb-10">
        <div className="text-center">
          <Link to="/" className="mx-auto flex h-24 w-32 items-center justify-center rounded-2xl bg-white shadow-[0_12px_30px_rgba(48,113,164,0.12)]">
            <img src="/logo.png" alt="Wash Panda" className="h-20 w-24 object-contain" />
          </Link>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#eaf4fc] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#3788c8]"><LuShieldCheck size={15} /> Secure admin portal</span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#172b3b] sm:text-[38px]">{copy[mode][0]}</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">{copy[mode][1]}</p>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

        {mode === "login" && setupRequired && <SetupPrompt onSetup={() => navigate("/setup-admin")} />}
        {mode === "login" && !setupRequired && <LoginForm loading={loading} showPassword={showPassword} setShowPassword={setShowPassword} onSubmit={login} />}
        {mode === "phone" && <PhoneForm phone={phone} setPhone={setPhone} loading={loading} onSubmit={sendCode} />}
        {mode === "code" && <CodeForm phone={phone} loading={loading} onSubmit={verifyCode} onResend={sendCode} />}
        {mode === "reset" && <ResetForm loading={loading} showPassword={showPassword} setShowPassword={setShowPassword} onSubmit={resetPassword} />}

        {mode !== "login" && <button type="button" onClick={goBack} className="mx-auto mt-5 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#4B95D1]"><LuArrowLeft /> Go back</button>}
        <div className="mt-7 flex items-center justify-center gap-2 border-t border-gray-100 pt-6 text-xs text-gray-400"><LuLockKeyhole size={14} /> Authorized WashPanda staff only</div>
      </section>
    </main>
  );
}

function SetupPrompt({ onSetup }) {
  return (
    <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-center">
      <LuShieldCheck className="mx-auto text-[#4B95D1]" size={34} />
      <h2 className="mt-3 text-lg font-bold text-gray-800">First-time admin setup</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">No admin account exists yet. Create your email, phone number and password now.</p>
      <button type="button" onClick={onSetup} className="mt-5 w-full rounded-xl bg-[#4B95D1] px-5 py-3 font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-600">Set up Admin Account</button>
    </div>
  );
}

function LoginForm({ loading, showPassword, setShowPassword, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <Input icon={LuMail} id="admin-email" name="email" type="email" label="Email address" placeholder="admin@washpanda.com" autoComplete="email" />
      <PasswordInput id="admin-password" name="password" label="Password" placeholder="Enter your password" show={showPassword} setShow={setShowPassword} autoComplete="current-password" />
      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-gray-600"><input type="checkbox" name="remember" className="h-4 w-4 accent-[#4B95D1]" />Remember me</label>
        <span className="text-xs font-semibold text-gray-400">Password reset temporarily unavailable</span>
      </div>
      <SubmitButton loading={loading}>Sign in to Dashboard</SubmitButton>
    </form>
  );
}

function PhoneForm({ phone, setPhone, loading, onSubmit }) {
  return <form onSubmit={onSubmit} className="mt-8 space-y-5"><Input icon={LuPhone} id="reset-phone" name="phone" type="tel" label="Registered phone number" placeholder="+923001234567" value={phone} onChange={(event) => setPhone(event.target.value)} pattern="^\+[1-9]\d{7,14}$" /><p className="text-xs leading-5 text-gray-400">Use international format with country code, for example +92.</p><SubmitButton loading={loading}>Send verification code</SubmitButton></form>;
}

function CodeForm({ phone, loading, onSubmit, onResend }) {
  return <form onSubmit={onSubmit} className="mt-8 space-y-5"><div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-gray-600"><LuMessageSquareText className="mr-2 inline text-[#4B95D1]" />Code sent to <strong>{phone}</strong></div><Input icon={LuKeyRound} id="verification-code" name="code" label="Verification code" placeholder="Enter SMS code" inputMode="numeric" minLength="4" maxLength="10" /><SubmitButton loading={loading}>Verify code</SubmitButton><button type="button" disabled={loading} onClick={onResend} className="w-full text-sm font-semibold text-[#4B95D1] disabled:opacity-50">Resend code</button></form>;
}

function ResetForm({ loading, showPassword, setShowPassword, onSubmit }) {
  return <form onSubmit={onSubmit} className="mt-8 space-y-5"><PasswordInput id="new-password" name="newPassword" label="New password" placeholder="Minimum 8 characters" minLength="8" show={showPassword} setShow={setShowPassword} autoComplete="new-password" /><PasswordInput id="confirm-password" name="confirmPassword" label="Confirm password" placeholder="Enter password again" minLength="8" show={showPassword} setShow={setShowPassword} autoComplete="new-password" /><SubmitButton loading={loading}>Update password</SubmitButton></form>;
}

function Input({ icon: Icon, label, id, ...props }) {
  return <label htmlFor={id} className="block text-sm font-semibold text-[#314252]">{label}<span className="relative mt-2 block"><Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#75a6cb]" size={19} /><input id={id} required {...props} className="w-full rounded-xl border border-[#dce8f1] bg-[#f8fbfd] py-3.5 pl-12 pr-4 font-normal text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#4B95D1] focus:bg-white focus:ring-4 focus:ring-blue-100/70" /></span></label>;
}

function PasswordInput({ show, setShow, label, id, ...props }) {
  return <label htmlFor={id} className="block text-sm font-semibold text-[#314252]">{label}<span className="relative mt-2 block"><LuLockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#75a6cb]" size={19} /><input id={id} type={show ? "text" : "password"} required {...props} className="w-full rounded-xl border border-[#dce8f1] bg-[#f8fbfd] py-3.5 pl-12 pr-12 font-normal text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#4B95D1] focus:bg-white focus:ring-4 focus:ring-blue-100/70" /><button type="button" onClick={() => setShow((visible) => !visible)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#4B95D1]">{show ? <LuEyeOff size={19} /> : <LuEye size={19} />}</button></span></label>;
}

function SubmitButton({ loading, children }) {
  return <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#438fca] to-[#2879b8] px-5 py-3.5 font-bold text-white shadow-[0_12px_26px_rgba(55,137,200,0.28)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">{loading ? "Please wait..." : children}</button>;
}
