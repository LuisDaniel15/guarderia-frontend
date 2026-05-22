'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API_URL from '@/api';

export default function NotificacionesPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ acudiente_id: '', nino_id: '', titulo: '', mensaje: '', canal: 'interna' });

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) router.push('/login');
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch(`${API_URL}/notificaciones/get_notificaciones`);
    setItems(await res.json());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/notificaciones/create_notificacion`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setModal(false);
    setForm({ acudiente_id: '', nino_id: '', titulo: '', mensaje: '', canal: 'interna' });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar esta notificacion?')) return;
    await fetch(`${API_URL}/notificaciones/delete_notificacion/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const estadoBadge = (e) => {
    if (e === 'enviada') return 'badge-blue';
    if (e === 'leida')   return 'badge-green';
    if (e === 'fallida') return 'badge-red';
    return 'badge-gray';
  };

  return (
    <>
      <div className="topbar">
        <h1>Notificaciones</h1>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nueva</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>ID</th><th>Titulo</th><th>Acudiente ID</th><th>Canal</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={6} className="empty-state">No hay notificaciones</td></tr>
            ) : items.map(i => (
              <tr key={i.id}>
                <td>{i.id}</td><td>{i.titulo}</td><td>{i.acudiente_id}</td>
                <td><span className="badge badge-blue">{i.canal}</span></td>
                <td><span className={`badge ${estadoBadge(i.estado)}`}>{i.estado}</span></td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(i.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Nueva Notificacion</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Acudiente ID</label><input type="number" value={form.acudiente_id} onChange={e => setForm({...form, acudiente_id: e.target.value})} required /></div>
              <div className="form-group"><label>Nino ID (opcional)</label><input type="number" value={form.nino_id} onChange={e => setForm({...form, nino_id: e.target.value})} /></div>
              <div className="form-group"><label>Titulo</label><input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required /></div>
              <div className="form-group"><label>Mensaje</label><textarea value={form.mensaje} onChange={e => setForm({...form, mensaje: e.target.value})} rows={3} required /></div>
              <div className="form-group">
                <label>Canal</label>
                <select value={form.canal} onChange={e => setForm({...form, canal: e.target.value})}>
                  <option value="interna">Interna</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Enviar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}