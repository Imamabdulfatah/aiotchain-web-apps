"use client";

import { getUserRole, isLoggedIn, logout } from "@/lib/auth";
import { ChevronLeft, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const loggedIn = isLoggedIn();
      const role = getUserRole();
      
      if (!loggedIn || (role !== "admin" && role !== "super_admin")) {
        setIsAuthorized(false);
        router.push("/");
      } else {
        setIsAuthorized(true);
      }
    };

    checkAdmin();
  }, [router]);

  const handleLogout = () => {
    logout();
  };

  const role = getUserRole();

  const allMenuItems = [
    { name: "Dashboard", href: "/admin", icon: "📊", roles: ["admin", "super_admin"] },
    { name: "Kelola Posts", href: "/admin/posts", icon: "📝", roles: ["admin", "super_admin"] },
    { name: "Alur Belajar", href: "/admin/quiz", icon: "🎓", roles: ["admin", "super_admin"] },
    { name: "Proyek Siswa", href: "/admin/submissions", icon: "📁", roles: ["admin", "super_admin"] },
    { name: "Asset 3D", href: "/admin/assets", icon: "🧊", roles: ["super_admin"] },
    { name: "Contacts", href: "/admin/contacts", icon: "📧", roles: ["super_admin"] },
    { name: "Sertifikat", href: "/admin/certificates", icon: "🏆", roles: ["super_admin"] },
    { name: "Payments", href: "/admin/payments", icon: "💳", roles: ["super_admin"] },
    { name: "Pengguna", href: "/admin/users", icon: "👥", roles: ["super_admin"] },
    { name: "Stats", href: "/admin/stats", icon: "📈", roles: ["super_admin"] },
  ];

  const menuItems = allMenuItems.filter(item => 
    role && item.roles.includes(role)
  );

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarCollapsed ? "w-20" : "w-72"
        } bg-card border-r border-border flex flex-col fixed h-full z-30 transition-all duration-300 ease-in-out`}
      >
        <div className={`p-6 border-b border-border flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
          {!isSidebarCollapsed && (
            <Link href="/" className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
                A
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight whitespace-nowrap">
                AIOT<span className="text-blue-600 font-light italic">Chain</span>
              </span>
            </Link>
          )}
          {isSidebarCollapsed && (
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
              A
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors ${isSidebarCollapsed ? "mt-0" : ""}`}
          >
            {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "space-x-3 px-4"} py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                  ? "bg-blue-600/10 text-blue-600 font-bold shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title={isSidebarCollapsed ? item.name : ""}
              >
                <span className="text-xl">{item.icon}</span>
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border bg-muted/50">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center justify-center ${isSidebarCollapsed ? "" : "space-x-2 px-4"} py-3 bg-card border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors font-semibold shadow-sm`}
            title={isSidebarCollapsed ? "Keluar Panel" : ""}
          >
            <span>🚪</span>
            {!isSidebarCollapsed && <span>Keluar Panel</span>}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main 
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-20" : "ml-72"
        } p-10 min-h-screen transition-all duration-300 ease-in-out`}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
