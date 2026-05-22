"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/",              label: "Dashboard",      icon: "🏠" },
  { href: "/ninos",         label: "Niños",          icon: "👶" },
  { href: "/acudientes",    label: "Acudientes",     icon: "👨‍👩‍👧" },
  { href: "/usuarios",      label: "Usuarios",       icon: "👤" },
  { href: "/asistencia",    label: "Asistencia",     icon: "📋" },
  { href: "/actividades",   label: "Actividades",    icon: "🎨" },
  { href: "/historial",     label: "Historial",      icon: "📖" },
  { href: "/notificaciones",label: "Notificaciones", icon: "🔔" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    router.push("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>🏫 Guardería</h2>
        <p>Sistema de Gestión</p>
      </div>
      <nav className="sidebar-nav">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "active" : ""}
          >
            <span>{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout}>🚪 Cerrar sesión</button>
      </div>
    </aside>
  );
}