'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API_URL from '@/api';

export default function ActividadesPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(false);
  const [detalleModal, setDetalleModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [rolId, setRolId] = useState(null);
  const [pestana, setPestana] = useState('participantes');
  const [actividadActual, setActividadActual] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [ninos, setNinos] = useState([]);

  const [form, setForm] = useState({
    titulo: '', descripcion: '', tipo: 'educativa',
    fecha: '', hora_inicio: '', grupo: '', grupo_id: ''
  });

  const [nuevoParticipante, setNuevoParticipante] = useState('');
  const [nuevoPersonal, setNuevoPersonal] = useState({ usuario_id: '', rol: 'apoyo' });

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) router.push('/login');
    const rol = parseInt(localStorage.getItem('rol_id'));
    setRolId(rol);
    fetchData();
    fetchGrupos();
    fetchUsuarios();
    fetchNinos();
  }, []);

  const fetchData = async () => {
    const res = await fetch(`${API_URL}/actividades/get_actividades`);
    setItems(await res.json());
  };

  const fetchGrupos = async () => {
    const res = await fetch(`${API_URL}/grupos/get_grupos`);
    setGrupos(await res.json());
  };

  const fetchUsuarios = async () => {
    const res = await fetch(`${API_URL}/usuarios/get_usuarios`);
    setUsuarios(await res.json());
  };

  const fetchNinos = async () => {
    const res = await fetch(`${API_URL}/ninos/get_ninos`);
    setNinos(await res.json());
  };

  const fetchDetalle = async (actividad) => {
    setActividadActual(actividad);
    const [p, per] = await Promise.all([
      fetch(`${API_URL}/actividad-participantes/get_by_actividad/${actividad.id}`).then(r => r.json()),
      fetch(`${API_URL}/actividad-personal/get_by_actividad/${actividad.id}`).then(r => r.json()),
    ]);
    setParticipantes(p);
    setPersonal(per);
    setPestana('participantes');
    setDetalleModal(true);
  };

  const handleGrupoChange = (valor) => {
    if (!valor) {
      setForm({ ...form, grupo_id: null, grupo: null });
    } else {
      const g = grupos.find(g => g.id === parseInt(valor));
      setForm({ ...form, grupo_id: parseInt(valor), grupo: g?.nombre || '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/actividades/update_actividad/${editId}` : `${API_URL}/actividades/create_actividad`;
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setModal(false); setEditId(null);
    setForm({ titulo: '', descripcion: '', tipo: 'educativa', fecha: '', hora_inicio: '', grupo: '', grupo_id: '' });
    fetchData();
  };

  const handleEdit = (item) => {
    setForm({ titulo: item.titulo, descripcion: item.descripcion || '', tipo: item.tipo, fecha: item.fecha, hora_inicio: item.hora_inicio || '', grupo: item.grupo || '', grupo_id: item.grupo_id || '' });
    setEditId(item.id); setModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar esta actividad?')) return;
    await fetch(`${API_URL}/actividades/delete_actividad/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const agregarParticipante = async () => {
    if (!nuevoParticipante) return;
    await fetch(`${API_URL}/actividad-participantes/create_participante`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actividad_id: actividadActual.id, nino_id: parseInt(nuevoParticipante), asistio: true })
    });
    setNuevoParticipante('');
    const res = await fetch(`${API_URL}/actividad-participantes/get_by_actividad/${actividadActual.id}`);
    setParticipantes(await res.json());
  };

  const eliminarParticipante = async (id) => {
    await fetch(`${API_URL}/actividad-participantes/delete_participante/${id}`, { method: 'DELETE' });
    const res = await fetch(`${API_URL}/actividad-participantes/get_by_actividad/${actividadActual.id}`);
    setParticipantes(await res.json());
  };

  const agregarPersonal = async () => {
    if (!nuevoPersonal.usuario_id) return;
    await fetch(`${API_URL}/actividad-personal/create_actividad_personal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actividad_id: actividadActual.id, usuario_id: parseInt(nuevoPersonal.usuario_id), rol: nuevoPersonal.rol })
    });
    setNuevoPersonal({ usuario_id: '', rol: 'apoyo' });
    const res = await fetch(`${API_URL}/actividad-personal/get_by_actividad/${actividadActual.id}`);
    setPersonal(await res.json());
  };

  const eliminarPersonal = async (id) => {
    await fetch(`${API_URL}/actividad-personal/delete_actividad_personal/${id}`, { method: 'DELETE' });
    const res = await fetch(`${API_URL}/actividad-personal/get_by_actividad/${actividadActual.id}`);
    setPersonal(await res.json());
  };

  const canEdit = rolId === 1 || rolId === 2;

  return (
    <>
      <div className="topbar">
        <h1>Actividades</h1>
        {canEdit && <button className="btn btn-primary" onClick={() => setModal(true)}>+ Agregar</button>}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>ID</th><th>Titulo</th><th>Tipo</th><th>Fecha</th><th>Hora</th><th>Grupo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} className="empty-state">No hay actividades registradas</td></tr>
            ) : items.map(i => (
              <tr key={i.id}>
                <td>{i.id}</td><td>{i.titulo}</td>
                <td><span className="badge badge-blue">{i.tipo}</span></td>
                <td>{i.fecha}</td><td>{i.hora_inicio || '-'}</td>
                <td><span className="badge badge-green">{i.grupo || '-'}</span></td>
                <td style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => fetchDetalle(i)}>Ver detalle</button>
                  {canEdit && <button className="btn btn-warning" onClick={() => handleEdit(i)}>Editar</button>}
                  {rolId === 1 && <button className="btn btn-danger" onClick={() => handleDelete(i.id)}>Eliminar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal crear/editar */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editId ? 'Editar Actividad' : 'Agregar Actividad'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Titulo</label><input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} required /></div>
              <div className="form-group"><label>Descripcion</label><textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={2} /></div>
              <div className="form-group">
                <label>Tipo</label>
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                  <option value="educativa">Educativa</option>
                  <option value="recreativa">Recreativa</option>
                  <option value="formativa">Formativa</option>
                  <option value="motriz">Motriz</option>
                  <option value="cultural">Cultural</option>
                  <option value="otra">Otra</option>
                </select>
              </div>
              <div className="form-group"><label>Fecha</label><input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required /></div>
              <div className="form-group"><label>Hora Inicio</label><input type="time" value={form.hora_inicio} onChange={e => setForm({ ...form, hora_inicio: e.target.value })} /></div>
              <div className="form-group">
                <label>Grupo</label>
                <select value={form.grupo_id ?? ''} onChange={e => handleGrupoChange(e.target.value)}>
                  <option value="">Todos los grupos</option>
                  {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => { setModal(false); setEditId(null); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalle con pestanas */}
      {detalleModal && actividadActual && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>{actividadActual.titulo}</h2>
              <button className="btn" onClick={() => setDetalleModal(false)}>Cerrar</button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              {actividadActual.fecha} — {actividadActual.tipo} — Grupo: {actividadActual.grupo || 'Todos'}
            </p>

            {/* Pestanas */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '2px solid #e2e8f0' }}>
              {['participantes', 'personal'].map(p => (
                <button key={p} onClick={() => setPestana(p)} style={{
                  padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: '13px',
                  fontWeight: pestana === p ? '600' : '400',
                  color: pestana === p ? '#2563eb' : '#64748b',
                  borderBottom: pestana === p ? '2px solid #2563eb' : '2px solid transparent',
                  background: 'none', marginBottom: '-2px'
                }}>
                  {p === 'participantes' ? `Ninos (${participantes.length})` : `Personal (${personal.length})`}
                </button>
              ))}
            </div>

            {/* Pestana Participantes */}
            {pestana === 'participantes' && (
              <>
                {canEdit && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <select value={nuevoParticipante} onChange={e => setNuevoParticipante(e.target.value)}
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}>
                      <option value="">Selecciona un nino</option>
                      {ninos
                        .filter(n => {
                          const yaAgregado = participantes.find(p => p.nino_id === n.id);
                          const mismoGrupo = actividadActual.grupo_id
                            ? n.grupo_id === actividadActual.grupo_id
                            : true;
                          return !yaAgregado && mismoGrupo;
                        })
                        .map(n => (
                          <option key={n.id} value={n.id}>{n.nombre} {n.apellido}</option>
                        ))
                      }
                    </select>
                    <button className="btn btn-primary" onClick={agregarParticipante}>Agregar</button>
                  </div>
                )}
                {participantes.length === 0 ? (
                  <p className="empty-state">No hay ninos agregados</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#64748b' }}>Nino</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#64748b' }}>Asistio</th>
                        {canEdit && <th></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {participantes.map(p => (
                        <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px', fontSize: '14px' }}>{p.nombre} {p.apellido}</td>
                          <td style={{ padding: '8px' }}>
                            <span className={`badge ${p.asistio ? 'badge-green' : 'badge-red'}`}>
                              {p.asistio ? 'Si' : 'No'}
                            </span>
                          </td>
                          {canEdit && (
                            <td style={{ padding: '8px' }}>
                              <button className="btn btn-danger" onClick={() => eliminarParticipante(p.id)}>Quitar</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}

            {/* Pestana Personal */}
            {pestana === 'personal' && (
              <>
                {canEdit && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <select value={nuevoPersonal.usuario_id} onChange={e => setNuevoPersonal({ ...nuevoPersonal, usuario_id: e.target.value })}
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}>
                      <option value="">Selecciona un usuario</option>
                      {usuarios.filter(u => !personal.find(p => p.usuario_id === u.id)).map(u => (
                        <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>
                      ))}
                    </select>
                    <select value={nuevoPersonal.rol} onChange={e => setNuevoPersonal({ ...nuevoPersonal, rol: e.target.value })}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}>
                      <option value="coordinador">Coordinador</option>
                      <option value="apoyo">Apoyo</option>
                      <option value="observador">Observador</option>
                    </select>
                    <button className="btn btn-primary" onClick={agregarPersonal}>Agregar</button>
                  </div>
                )}
                {personal.length === 0 ? (
                  <p className="empty-state">No hay personal asignado</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#64748b' }}>Usuario</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#64748b' }}>Rol</th>
                        {canEdit && <th></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {personal.map(p => (
                        <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px', fontSize: '14px' }}>{p.nombre} {p.apellido}</td>
                          <td style={{ padding: '8px' }}>
                            <span className="badge badge-blue">{p.rol}</span>
                          </td>
                          {canEdit && (
                            <td style={{ padding: '8px' }}>
                              <button className="btn btn-danger" onClick={() => eliminarPersonal(p.id)}>Quitar</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}