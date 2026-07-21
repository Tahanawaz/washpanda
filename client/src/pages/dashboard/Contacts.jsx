import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getContacts, updateContact } from "../../services/api";

const statuses = ["New", "Read", "Replied"];

export default function Contacts() {
  const { search = "" } = useOutletContext() || {};
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getContacts()
      .then((payload) => {
        if (active) setContacts(payload.data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((contact) => Object.values(contact).join(" ").toLowerCase().includes(query));
  }, [contacts, search]);

  const changeStatus = async (id, status) => {
    try {
      setError("");
      const payload = await updateContact(id, status);
      setContacts((current) => current.map((contact) => contact._id === id ? payload.data : contact));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-lg font-semibold text-gray-600"><span className="text-[#4B95D1]">Dashboard</span>/Contacts</p>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_7px_25px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-800">
                {['Name', 'Email', 'Phone', 'Message', 'Received', 'Status'].map((heading) => (
                  <th key={heading} className="px-6 py-4 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => (
                <tr key={contact._id} className="border-b border-gray-100 align-top text-sm text-gray-600">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-800">{contact.name}</td>
                  <td className="px-6 py-4">{contact.email}</td>
                  <td className="whitespace-nowrap px-6 py-4">{contact.phone}</td>
                  <td className="max-w-md px-6 py-4">{contact.message}</td>
                  <td className="whitespace-nowrap px-6 py-4">{new Date(contact.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="px-6 py-4">
                    <select value={contact.status} onChange={(event) => changeStatus(contact._id, event.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2 outline-none focus:border-[#4B95D1]">
                      {statuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {loading && <tr><td colSpan="6" className="px-6 py-14 text-center text-gray-500">Loading messages...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan="6" className="px-6 py-14 text-center text-gray-500">No contact messages found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
