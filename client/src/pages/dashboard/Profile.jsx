import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuCamera, LuCheck, LuKeyRound, LuLockKeyhole, LuMail, LuPhone, LuSave, LuUser } from "react-icons/lu";
import { changeAdminPassword, getAdminProfile as fetchAdminProfile, updateAdminProfile } from "../../services/api";
import { getAdminProfile as getSavedAdminProfile, saveAdminProfile } from "../../services/adminProfileStorage";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export default function Profile() {
  const [profile, setProfile] = useState(getSavedAdminProfile);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    fetchAdminProfile()
      .then((payload) => {
        setProfile(payload.data);
        saveAdminProfile(payload.data);
      })
      .catch((error) => toast.error(error.message));
  }, []);

  const updateField = (event) => {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
    setSaved(false);
  };

  const chooseAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Profile image must be 5 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((current) => ({ ...current, avatar: String(reader.result) }));
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = await updateAdminProfile(profile);
      setProfile(payload.data);
      saveAdminProfile(payload.data);
      setSaved(true);
      toast.success("Admin information updated successfully.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await changeAdminPassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Admin password updated successfully.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#4B95D1]">Account settings</p>
        <h1 className="mt-1 text-3xl font-bold text-[#202b36]">Manage profile</h1>
        <p className="mt-2 text-gray-500">Update the information shown across your admin dashboard.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          <LuCheck className="rounded-full bg-green-600 p-0.5 text-white" size={19} /> Profile updated successfully.
        </div>
      )}

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl bg-gradient-to-b from-[#eaf5fd] to-white p-6 text-center shadow-[0_8px_30px_rgba(38,100,148,0.08)]">
          <div className="relative mx-auto h-36 w-36">
            <img src={profile.avatar} alt={profile.name} className="h-full w-full rounded-[28px] border-4 border-white object-cover shadow-lg" />
            <label className="absolute -bottom-2 -right-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-[#4B95D1] text-white shadow-lg transition hover:bg-blue-600" aria-label="Change profile photo">
              <LuCamera size={20} />
              <input type="file" accept="image/*" onChange={chooseAvatar} className="sr-only" />
            </label>
          </div>
          <p className="mt-4 text-xs font-medium text-gray-400">JPG, PNG or WebP · Maximum 5 MB</p>
          <h2 className="mt-3 text-2xl font-bold text-gray-800">{profile.name}</h2>
          <p className="mt-1 font-medium text-[#4B95D1]">{profile.role}</p>
          <p className="mt-4 text-sm leading-6 text-gray-500">{profile.bio}</p>
          <div className="mt-6 rounded-xl border border-blue-100 bg-white px-4 py-3 text-left text-sm text-gray-500">
            <p className="flex items-center gap-2 font-semibold text-gray-700"><LuLockKeyhole className="text-[#4B95D1]" /> Profile visibility</p>
            <p className="mt-1 pl-6 text-xs leading-5">Visible only inside the admin dashboard.</p>
          </div>
        </aside>

        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(38,100,148,0.07)] sm:p-8">
          <div className="mb-7 border-b border-gray-100 pb-5">
            <h2 className="text-xl font-bold text-gray-800">Personal information</h2>
            <p className="mt-1 text-sm text-gray-500">Keep your admin account details up to date.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <ProfileField icon={LuUser} label="Full name" name="name" value={profile.name} onChange={updateField} />
            <ProfileField icon={LuUser} label="Role" name="role" value={profile.role} onChange={updateField} />
            <ProfileField icon={LuMail} label="Email address" name="email" type="email" value={profile.email} onChange={updateField} />
            <ProfileField icon={LuPhone} label="Phone number" name="phone" value={profile.phone} onChange={updateField} />
            <label htmlFor="profile-bio" className="block text-sm font-semibold text-gray-700 sm:col-span-2">
              Short bio
              <textarea id="profile-bio" name="bio" rows="4" maxLength="220" value={profile.bio} onChange={updateField} className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-[#fbfdff] px-4 py-3 font-normal text-gray-700 outline-none transition focus:border-[#4B95D1] focus:ring-4 focus:ring-blue-50" />
            </label>
          </div>

          <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-[#4B95D1] px-6 py-3 font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-600 disabled:cursor-wait disabled:opacity-60">
              <LuSave size={19} /> {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </section>
      </form>

      <form onSubmit={submitPassword} className="ml-auto rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(38,100,148,0.07)] sm:p-8 lg:w-[calc(100%-344px)]">
        <div className="flex items-start gap-4 border-b border-gray-100 pb-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#4B95D1]"><LuKeyRound size={21} /></span>
          <div><h2 className="text-xl font-bold text-gray-800">Change password</h2><p className="mt-1 text-sm text-gray-500">Confirm your current password before choosing a new one.</p></div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <PasswordField label="Current password" name="currentPassword" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} className="sm:col-span-2" />
          <PasswordField label="New password" name="newPassword" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} />
          <PasswordField label="Confirm new password" name="confirmPassword" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} />
        </div>
        <div className="mt-7 flex justify-end border-t border-gray-100 pt-6">
          <button type="submit" disabled={passwordSaving} className="flex items-center gap-2 rounded-xl bg-[#253b4d] px-6 py-3 font-bold text-white transition hover:bg-[#172b3b] disabled:cursor-wait disabled:opacity-60"><LuLockKeyhole size={18} />{passwordSaving ? "Updating..." : "Update password"}</button>
        </div>
      </form>
    </div>
  );
}

function PasswordField({ label, name, value, onChange, className = "" }) {
  return (
    <label htmlFor={`password-${name}`} className={`block text-sm font-semibold text-gray-700 ${className}`}>
      {label}
      <span className="relative mt-2 block">
        <LuLockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#72a5cc]" size={18} />
        <input id={`password-${name}`} name={name} type="password" autoComplete={name === "currentPassword" ? "current-password" : "new-password"} minLength="8" required value={value} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-[#fbfdff] py-3 pl-11 pr-4 font-normal text-gray-700 outline-none transition focus:border-[#4B95D1] focus:ring-4 focus:ring-blue-50" />
      </span>
    </label>
  );
}

function ProfileField({ icon: Icon, label, name, value, onChange, type = "text" }) {
  return (
    <label htmlFor={`profile-${name}`} className="block text-sm font-semibold text-gray-700">
      {label}
      <span className="relative mt-2 block">
        <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#72a5cc]" size={18} />
        <input id={`profile-${name}`} name={name} type={type} value={value} onChange={onChange} required className="w-full rounded-xl border border-gray-200 bg-[#fbfdff] py-3 pl-11 pr-4 font-normal text-gray-700 outline-none transition focus:border-[#4B95D1] focus:ring-4 focus:ring-blue-50" />
      </span>
    </label>
  );
}
