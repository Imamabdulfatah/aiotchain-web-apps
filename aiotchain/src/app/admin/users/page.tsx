"use client";

import withAuth from "@/components/withAuth";
import { fetchAPI } from "@/lib/api";
import { getUserRole } from "@/lib/auth";
import { Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface UserData {
  ID: number;
  username: string;
  email: string;
  role: string;
  phone: string;
  interests: string;
  referral_source: string;
  CreatedAt: string;
}

function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await fetchAPI<UserData[]>("/admin/users");
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentRole(getUserRole());
    fetchUsers();
  }, []);

  const handleUpdateRole = async (id: number, newRole: string) => {
    setUpdatingId(id);
    try {
      await fetchAPI(`/admin/users/${id}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      setUsers(users.map(u => u.ID === id ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui role pengguna.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return;
    try {
      await fetchAPI(`/admin/users/${id}`, { method: "DELETE" });
      setUsers(users.filter(u => u.ID !== id));
    } catch (err: any) {
      alert(err.message || "Gagal menghapus pengguna.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Kelola Pengguna</h1>
          <p className="text-muted-foreground font-medium mt-1">Daftar pengguna terdaftar dan data onboarding mereka.</p>
        </div>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-red-600 rounded-3xl font-medium">
          {error}
        </div>
      ) : (
        <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Pengguna</th>
                  <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Kontak</th>
                  <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Minat & Referral</th>
                  <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-6">
                        <div className="h-12 bg-muted rounded-2xl w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground italic font-medium">
                      Belum ada pengguna terdaftar.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.ID} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-lg">{user.username}</p>
                            {currentRole === "super_admin" ? (
                              <div className="flex items-center gap-2 mt-1">
                                <select
                                  disabled={updatingId === user.ID}
                                  value={user.role}
                                  onChange={(e) => handleUpdateRole(user.ID, e.target.value)}
                                  className="text-xs font-bold text-blue-600 uppercase tracking-tighter bg-blue-600/10 px-2 py-1 rounded-md border-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                >
                                  <option value="user">USER</option>
                                  <option value="admin">ADMIN</option>
                                  <option value="super_admin">SUPER ADMIN</option>
                                </select>
                                {updatingId === user.ID && (
                                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter bg-blue-600/10 px-2 py-0.5 rounded-md inline-block mt-1">
                                {user.role}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            <Mail size={14} className="text-blue-500" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                              <Phone size={14} className="text-emerald-500" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {user.interests ? (
                              user.interests.split(",").map(interest => (
                                <span key={interest} className="text-[10px] font-bold bg-muted text-foreground px-2.5 py-1 rounded-full border border-border">
                                  {interest}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Belum mengisi minat</span>
                            )}
                          </div>
                          {user.referral_source && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-600/10 px-2.5 py-1 rounded-full border border-indigo-200 w-fit">
                              <MapPin size={10} />
                              <span>{user.referral_source}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(user.ID)}
                            className="p-3 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all active:scale-90"
                            title="Hapus Pengguna"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(UserManagementPage);
