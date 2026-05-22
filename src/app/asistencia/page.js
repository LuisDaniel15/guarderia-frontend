'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API_URL from '@/api';

export default function AsistenciaPage() {
  const router = useRouter();
  const [ninos, setNinos] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [asistenciaHoy, setAsistenciaHoy] = useState({});
  const [loading, setLoading] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [rolId, setRolId] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);
const [today, setToday] = useState('');


  useEffect(() => {
    setToday(new Date().toLocaleDateString('es-CO', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
}));
    if (!localStorage.getItem('isLoggedIn')) router.push('/login');
    const rol = parseInt(localStorage.getItem('rol_id'));
    const grupo = parseInt(localStorage.getItem('grupo_id'));
    const usuario = parseInt(localStorage.getItem('usuario_id'));
    setRolId(rol);
    setUsuarioId(usuario);
    fetchNinos(rol, grupo);
    fetchAsistenciasHoy();
  }, []);

  const fetchNinos = async (rol, grupo) => {
    let url = `${API_URL}/ninos/get_ninos`;
    if (rol === 2 && grupo) url = `${API_URL}/ninos/get_ninos_by_grupo/${grupo}`;
    const res = await fetch(url);
    const data = await res.json();
    setNinos(data);
    const inicial = {};
    data.forEach(n => { inicial[n.id] = 'presente'; });
    setAsistenciaHoy(inicial);
  };

  const fetchAsistenciasHoy = async () => {
    const grupo = parseInt(localStorage.getItem('grupo_id'));
    const rol = parseInt(localStorage.getItem('rol_id'));
    let url = `${API_URL}/asistencia/get_asistencias_hoy`;
    if (rol === 2 && grupo) url += `?grupo_id=${grupo}`;
    const res = await fetch(url);
    const data = await res.json();
    setAsistencias(data);
    const estados = {};
    data.forEach(a => { estados[a.nino_id] = a.estado; });
    setAsistenciaHoy(prev => ({ ...prev, ...estados }));
  };

  const handleEstado = (nino_id, estado) => {
    setAsistenciaHoy(prev => ({ ...prev, [nino_id]: estado }));
  };

  const handleGuardar = async () => {
    setLoading(true);
    const registros = ninos.map(n => ({
      nino_id: n.id,
      estado: asistenciaHoy[n.id] || 'presente',
      registrado_por: usuarioId
    }));
    await fetch(`${API_URL}/asistencia/registrar_masiva`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registros)
    });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
    fetchAsistenciasHoy();
    setLoading(false);
  };

  const estadoBadge = (e) => {
    if (e === 'presente') return 'badge-green';
    if (e === 'ausente') return 'badge-red';
    if (e === 'tardanza') return 'badge-yellow';
    if (e === 'justificado') return 'badge-blue';
    return 'badge-gray';
  };

  const canEdit = rolId === 1 || rolId === 2;

  // const today = new Date().toLocaleDateString('es-CO', {
  //   weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  // });

  return (
    <>
      <div className="topbar">
        <h1>Asistencia</h1>
        
      </div>

      {canEdit && (
        <div className="table-container" style={{ marginBottom: '24px' }}>
          <div className="table-header">
            <h2>Registrar asistencia de hoy {today} </h2>
            {/* <span style={{ fontSize: '13px', color: '#000000' }}>{today}</span> */}
            {guardado && <span className="badge badge-green">Guardado!</span>}
          </div>
          <table>
            <thead>
              <tr><th>Nino</th><th>Grupo</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {ninos.length === 0 ? (
                <tr><td colSpan={3} className="empty-state">No hay ninos en tu grupo</td></tr>
              ) : ninos.map(n => (
                <tr key={n.id}>
                  <td>{n.nombre} {n.apellido}</td>
                  <td><span className="badge badge-blue">{n.grupo}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['presente', 'ausente', 'tardanza', 'justificado'].map(estado => {
                        const selected = asistenciaHoy[n.id] === estado;
                        const colors = {
                          presente: { bg: '#16a34a', color: 'white' },
                          ausente: { bg: '#dc2626', color: 'white' },
                          tardanza: { bg: '#d97706', color: 'white' },
                          justificado: { bg: '#2563eb', color: 'white' },
                        };
                        return (
                          <button
                            key={estado}
                            onClick={() => handleEstado(n.id, estado)}
                            style={{
                              padding: '5px 12px',
                              fontSize: '12px',
                              fontWeight: selected ? '700' : '400',
                              borderRadius: '6px',
                              border: `2px solid ${colors[estado].bg}`,
                              background: selected ? colors[estado].bg : 'white',
                              color: selected ? colors[estado].color : colors[estado].bg,
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            {estado}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ninos.length > 0 && (
            <div style={{ padding: '16px 20px' }}>
              <button className="btn btn-primary" onClick={handleGuardar} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar asistencia'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h2>Registros de hoy</h2>
        </div>
        <table>
          <thead>
            <tr><th>Nino</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {asistencias.length === 0 ? (
              <tr><td colSpan={2} className="empty-state">No hay registros hoy</td></tr>
            ) : asistencias.map(a => (
              <tr key={a.id}>
                <td>{a.nombre} {a.apellido}</td>
                <td><span className={`badge ${estadoBadge(a.estado)}`}>{a.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}