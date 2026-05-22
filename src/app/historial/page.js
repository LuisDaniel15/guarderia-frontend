'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API_URL from '@/api';

export default function HistorialPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [rolId, setRolId] = useState(null);
  const [ninos, setNinos] = useState([]);
  const [ninosSeleccionados, setNinosSeleccionados] = useState([]);
  const [form, setForm] = useState({
    autor_id: '', categoria: 'general', titulo: '',
    descripcion: '', medidas_tomadas: '', acudiente_notificado: false
  });

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) router.push('/login');
    const rol = parseInt(localStorage.getItem('rol_id'));
    const usuario = parseInt(localStorage.getItem('usuario_id'));
    setRolId(rol);
    setForm(prev => ({ ...prev, autor_id: usuario }));
    fetchData();
    fetchNinos(rol);
  }, []);

  const fetchData = async () => {
    const res = await fetch(`${API_URL}/historial/get_historiales`);
    setItems(await res.json());
  };

  const fetchNinos = async (rol) => {
    const grupo = parseInt(localStorage.getItem('grupo_id'));
    let url = `${API_URL}/ninos/get_ninos`;
    if (rol === 2 && grupo) url = `${API_URL}/ninos/get_ninos_by_grupo/${grupo}`;
    const res = await fetch(url);
    setNinos(await res.json());
  };

  const toggleNino = (id) => {
    setNinosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await fetch(`${API_URL}/historial/update_historial/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    } else {
      await fetch(`${API_URL}/historial/crear_completo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ninos: ninosSeleccionados })
      });
    }
    setModal(false); setEditId(null);
    setNinosSeleccionados([]);
    const usuario = parseInt(localStorage.getItem('usuario_id'));
    setForm({ autor_id: usuario, categoria: 'general', titulo: '', descripcion: '', medidas_tomadas: '', acudiente_notificado: false });
    fetchData();
  };

  const handleEdit = (item) => {
    setForm({
      autor_id: item.autor_id,
      categoria: item.categoria,
      titulo: item.titulo || '',
      descripcion: item.descripcion,
      medidas_tomadas: item.medidas_tomadas || '',
      acudiente_notificado: item.acudiente_notificado
    });
    setEditId(item.id); setModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este registro?')) return;
    await fetch(`${API_URL}/historial/delete_historial/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const catBadge = (c) => {
    if (c === 'incidente') return 'badge-red';
    if (c === 'logro') return 'badge-green';
    if (c === 'progreso') return 'badge-blue';
    if (c === 'salud') return 'badge-yellow';
    if (c === 'comportamiento') return 'badge-gray';
    return 'badge-gray';
  };

  const canEdit = rolId === 1 || rolId === 2;

  return (
    <>
      <div className="topbar">
        <h1>Historial</h1>
        {canEdit && <button className="btn btn-primary" onClick={() => { setModal(true); setEditId(null); }}>+ Agregar</button>}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>ID</th><th>Titulo</th><th>Categoria</th><th>Fecha</th><th>Notificado</th>{canEdit && <th>Acciones</th>}</tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={6} className="empty-state">No hay registros en el historial</td></tr>
            ) : items.map(i => (
              <tr key={i.id}>
                <td>{i.id}</td><td>{i.titulo || '-'}</td>
                <td><span className={`badge ${catBadge(i.categoria)}`}>{i.categoria}</span></td>
                <td>{i.fecha}</td>
                <td><span className={`badge ${i.acudiente_notificado ? 'badge-green' : 'badge-gray'}`}>{i.acudiente_notificado ? 'Si' : 'No'}</span></td>
                {canEdit && (
                  <td style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-warning" onClick={() => handleEdit(i)}>Editar</button>
                    {rolId === 1 && <button className="btn btn-danger" onClick={() => handleDelete(i.id)}>Eliminar</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editId ? 'Editar Registro' : 'Nuevo Registro'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Categoria</label>
                <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  <option value="general">General</option>
                  <option value="comportamiento">Comportamiento</option>
                  <option value="progreso">Progreso</option>
                  <option value="salud">Salud</option>
                  <option value="incidente">Incidente</option>
                  <option value="logro">Logro</option>
                </select>
              </div>
              <div className="form-group"><label>Titulo</label><input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} /></div>
              <div className="form-group"><label>Descripcion</label><textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={3} required /></div>
              {form.categoria === 'incidente' && (
                <div className="form-group"><label>Medidas Tomadas</label><textarea value={form.medidas_tomadas} onChange={e => setForm({ ...form, medidas_tomadas: e.target.value })} rows={2} /></div>
              )}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.acudiente_notificado}
                    onChange={e => setForm({ ...form, acudiente_notificado: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span>Acudiente notificado</span>
                </label>
              </div>
              {!editId && (
                <div className="form-group">
                  <label>Ninos involucrados</label>
                  <div style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                    {ninos.length === 0 ? (
                      <p style={{ fontSize: '13px', color: '#94a3b8' }}>No hay ninos disponibles</p>
                    ) : ninos.map(n => (
                      <label key={n.id} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '6px 8px', cursor: 'pointer', fontSize: '14px',
                        borderRadius: '6px',
                        background: ninosSeleccionados.includes(n.id) ? '#eff6ff' : 'transparent'
                      }}>
                        <input
                          type="checkbox"
                          checked={ninosSeleccionados.includes(n.id)}
                          onChange={() => toggleNino(n.id)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                        />
                        <span style={{ flex: 1 }}>{n.nombre} {n.apellido}</span>
                        <span className="badge badge-blue" style={{ fontSize: '10px' }}>{n.grupo}</span>
                      </label>
                    ))}
                  </div>
                  {ninosSeleccionados.length > 0 && (
                    <p style={{ fontSize: '12px', color: '#2563eb', marginTop: '4px' }}>
                      {ninosSeleccionados.length} nino(s) seleccionado(s)
                    </p>
                  )}
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn" onClick={() => { setModal(false); setEditId(null); setNinosSeleccionados([]); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}