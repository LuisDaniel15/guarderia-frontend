'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API_URL from '@/api';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ ninos: 0, acudientes: 0, usuarios: 0, actividades: 0 });

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) router.push('/login');
    const fetchStats = async () => {
      try {
        const [ninos, acudientes, usuarios, actividades] = await Promise.all([
          fetch(`${API_URL}/ninos/get_ninos`).then(r => r.json()),
          fetch(`${API_URL}/acudientes/get_acudientes`).then(r => r.json()),
          fetch(`${API_URL}/usuarios/get_usuarios`).then(r => r.json()),
          fetch(`${API_URL}/actividades/get_actividades`).then(r => r.json()),
        ]);
        setStats({
          ninos: Array.isArray(ninos) ? ninos.length : 0,
          acudientes: Array.isArray(acudientes) ? acudientes.length : 0,
          usuarios: Array.isArray(usuarios) ? usuarios.length : 0,
          actividades: Array.isArray(actividades) ? actividades.length : 0,
        });
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  return (
    <>
      <div className="topbar">
        <h1>Dashboard</h1>
      </div>
      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Ninos</h3>
          <p>{stats.ninos}</p>
        </div>
        <div className="stat-card">
          <h3>Acudientes</h3>
          <p>{stats.acudientes}</p>
        </div>
        <div className="stat-card">
          <h3>Usuarios</h3>
          <p>{stats.usuarios}</p>
        </div>
        <div className="stat-card">
          <h3>Actividades</h3>
          <p>{stats.actividades}</p>
        </div>
      </div>
      <div>
        <iframe title="REPORTE_POR_GRUPO_TABLA_NIÑOS" width="1140" height="541.25" src="https://app.powerbi.com/reportEmbed?reportId=1232999f-aa0f-4d9c-8f09-3efdc099bb98&autoAuth=true&ctid=c7a7ca2a-329c-4bbc-afdb-666e11189b83"></iframe>
      </div>
    </>
  );
}