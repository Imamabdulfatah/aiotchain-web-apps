"use client";

import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Contact {
  id: number;
  name: string;
  email: string;
  category: string;
  message: string;
  status: "new" | "read" | "resolved" | "archived";
  createdAt: string;
  updatedAt: string;
}

export default function AdminContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchContacts();
  }, [filterStatus, filterCategory, searchQuery]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (filterCategory) params.append("category", filterCategory);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/contacts?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      } else {
        console.error("Failed to fetch contacts");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/contacts/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        fetchContacts();
      } else {
        alert("Gagal mengupdate status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteContact = async (id: number) => {
    if (!confirm("Yakin ingin menghapus kontak ini?")) return;

    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/contacts/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        fetchContacts();
      } else {
        alert("Gagal menghapus kontak");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      new: "bg-blue-100 text-blue-700 border-blue-200",
      read: "bg-yellow-100 text-yellow-700 border-yellow-200",
      resolved: "bg-green-100 text-green-700 border-green-200",
      archived: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return badges[status as keyof typeof badges] || badges.new;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      "General Inquiry": "💬",
      "Pengaduan Layanan": "⚠️",
      "Kerjasama Bisnis": "🤝",
      Lainnya: "📝",
    };
    return icons[category] || "📧";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Contact & Complaints
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Kelola pesan dan pengaduan dari pengguna
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm border border-blue-100">
            {contacts.length} Total Pesan
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-semibold text-slate-700"
            >
              <option value="">Semua Status</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Kategori
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-semibold text-slate-700"
            >
              <option value="">Semua Kategori</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Pengaduan Layanan">Pengaduan Layanan</option>
              <option value="Kerjasama Bisnis">Kerjasama Bisnis</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Cari
            </label>
            <input
              type="text"
              placeholder="Nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-semibold text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-slate-400 font-semibold">
            Memuat data...
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-20 text-center text-slate-400 font-semibold">
            Tidak ada kontak ditemukan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                    Pengirim
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                    Pesan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-900">
                          {contact.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {contact.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {getCategoryIcon(contact.category)}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {contact.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 line-clamp-2 max-w-md">
                        {contact.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={contact.status}
                        onChange={(e) =>
                          updateStatus(contact.id, e.target.value)
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${getStatusBadge(
                          contact.status
                        )} cursor-pointer`}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(contact.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteContact(contact.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors border border-red-100"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
