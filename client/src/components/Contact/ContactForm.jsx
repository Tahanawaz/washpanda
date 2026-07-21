const fields = [
  { id: "name", label: "Full Name", type: "text", placeholder: "Enter full name" },
  { id: "email", label: "Email", type: "email", placeholder: "Enter email address" },
  { id: "phone", label: "Phone Number", type: "tel", placeholder: "Enter phone number" },
];

export default function ContactForm() {
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setStatus({ loading: true, error: "", success: "" });
    try {
      await createContact({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message: form.get("message"),
        website: form.get("website"),
      });
      formElement.reset();
      setStatus({ loading: false, error: "", success: "Thank you! Your message has been sent." });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id} className="mb-1.5 block text-sm font-semibold text-gray-800">
            {field.label}<span className="text-red-500">*</span>
          </label>
          <input
            id={field.id}
            name={field.id}
            type={field.type}
            placeholder={field.placeholder}
            required
            maxLength={field.id === "email" ? 160 : field.id === "phone" ? 24 : 120}
            className="w-full rounded border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#4A9EFF] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      ))}

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-gray-800">
          Message<span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows="5"
          placeholder="Enter message"
          required
          minLength="10"
          maxLength="2000"
          className="w-full resize-none rounded border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#4A9EFF] focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <label className="absolute -left-[9999px]" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" /></label>

      <button type="submit" disabled={status.loading} className="rounded bg-[#4A9EFF] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-wait disabled:opacity-60">
        {status.loading ? "Sending..." : "Send Message"}
      </button>
      {status.error && <p role="alert" className="text-sm font-medium text-red-600">{status.error}</p>}
      {status.success && <p className="text-sm font-medium text-green-600">{status.success}</p>}
    </form>
  );
}
import { useState } from "react";
import { createContact } from "../../services/api";
