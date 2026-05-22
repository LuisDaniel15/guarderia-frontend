'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Baby,
  Users,
  UserCog,
  ClipboardCheck,
  CalendarCheck,
  History,
  Bell
} from 'lucide-react';
import { LogOut } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [rolId, setRolId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');


  useEffect(() => {
    setRolId(parseInt(localStorage.getItem('rol_id')));
    setNombre(localStorage.getItem('nombre') || '');
    setApellido(localStorage.getItem('apellido') || '');
  }, []);

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: [1, 2, 3] },
    { href: '/ninos', label: 'Ninos', icon: Baby, roles: [1, 2, 3] },
    { href: '/acudientes', label: 'Acudientes', icon: Users, roles: [1, 2, 3] },
    { href: '/usuarios', label: 'Usuarios', icon: UserCog, roles: [1] },
    { href: '/asistencia', label: 'Asistencia', icon: ClipboardCheck, roles: [1, 2, 3] },
    { href: '/actividades', label: 'Actividades', icon: CalendarCheck, roles: [1, 2, 3] },
    { href: '/historial', label: 'Historial', icon: History, roles: [1, 2, 3] },
    { href: '/notificaciones', label: 'Notificaciones', icon: Bell, roles: [1, 2] },
  ];

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="sidebar">
      <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '20px',
    marginBottom: '18px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  }}
>
  <div
    style={{
      width: '58px',
      height: '58px',
      minWidth: '58px',
      borderRadius: '16px',
      background: 'rgba(255,255,255,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
      backdropFilter: 'blur(8px)',
    }}
  >
    <img
      src="/logo.png"
      alt="Logo"
      style={{
        width: '82%',
        height: '82%',
        objectFit: 'contain',
      }}
    />
  </div>

  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <h2
      style={{
        color: '#fff',
        margin: 0,
        fontSize: '20px',
        fontWeight: '700',
        lineHeight: '1.1',
        letterSpacing: '0.3px',
      }}
    >
      Guardería
    </h2>

    <span
      style={{
        color: 'rgba(255,255,255,0.6)',
        fontSize: '12px',
        marginTop: '4px',
        fontWeight: '500',
        letterSpacing: '0.4px',
      }}
    >
      Sistema Infantil
    </span>
  </div>
</div>
      <nav className="sidebar-nav">
        {links.filter(l => rolId && l.roles.includes(rolId)).map(link => (

          <a
            key={link.href}
            href={link.href}
            className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <>
              <link.icon size={18} />
              <span>{link.label}</span>
            </>
          </a>
        ))}
      </nav>
      <div className="sidebar-logout">
        {nombre && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', padding: '0 20px 10px' }}>
            {nombre} {apellido}
          </p>
        )}
        <button className="sidebar-link" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Cerrar sesion</span>
        </button>
      </div>
    </div>
  );
}