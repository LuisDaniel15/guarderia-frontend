'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API_URL from '@/api';

export default function UsuariosPage() {
  const router = useRouter();
  const [items, setItems]   = useState([]);
  const [modal, setModal]   = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState({ nombre: '', apellido: '', email: '', password_hash: '', rol_id: 2, grupo_id: '', activo: true });

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) router.push('/login');
    const rol = parseInt(localStorage.getItem('rol_id'));
    if (rol !== 1) { router.push('/'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch(`${API_URL}/usuarios/get_usuarios`);
    setItems(await res.json());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url    = editId ? `${API_URL}/usuarios/update_usuario/${editId}` : `${API_URL}/usuarios/create_usuario`;
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setModal(false); setEditId(null);
    setForm({ nombre: '', apellido: '', email: '', password_hash: '', rol_id: 2, grupo_id: '', activo: true });
    fetchData();
  };

  const handleEdit = (item) => {
    setForm({ nombre: item.nombre, apellido: item.apellido, email: item.email, password_hash: '', rol_id: item.rol_id, grupo_id: item.grupo_id || '', activo: item.activo });
    setEditId(item.id); setModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Desactivar este usuario?')) return;
    await fetch(`${API_URL}/usuarios/delete_usuario/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const rolLabel = (rol_id) => {
    if (rol_id === 1) return { label: 'Admin',    badge: 'badge-red'  };
    if (rol_id === 2) return { label: 'Cuidador', badge: 'badge-blue' };
    return                   { label: 'Auxiliar', badge: 'badge-gray' };
  };

  return (
    <>
      <div className="topbar">
        <h1>Usuarios</h1>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Agregar</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Apellido</th><th>Email</th><th>Rol</th><th>Grupo ID</th><th>Activo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={8} className="empty-state">No hay usuarios registrados</td></tr>
            ) : items.map(i => (
              <tr key={i.id}>
                <td>{i.id}</td><td>{i.nombre}</td><td>{i.apellido}</td><td>{i.email}</td>
                <td><span className={`badge ${rolLabel(i.rol_id).badge}`}>{rolLabel(i.rol_id).label}</span></td>
                <td>{i.grupo_id || '-'}</td>
                <td><span className={`badge ${i.activo ? 'badge-green' : 'badge-red'}`}>{i.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-warning" onClick={() => handleEdit(i)}>Editar</button>
                  <button className="btn btn-danger"  onClick={() => handleDelete(i.id)}>Desactivar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editId ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Nombre</label><input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required /></div>
              <div className="form-group"><label>Apellido</label><input value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} required /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              {!editId && <div className="form-group"><label>Password</label><input type="password" value={form.password_hash} onChange={e => setForm({...form, password_hash: e.target.value})} required /></div>}
              <div className="form-group">
                <label>Rol</label>
                <select value={form.rol_id} onChange={e => setForm({...form, rol_id: parseInt(e.target.value)})}>
                  <option value={1}>Admin</option>
                  <option value={2}>Cuidador</option>
                  <option value={3}>Auxiliar</option>
                </select>
              </div>
              <div className="form-group"><label>Grupo ID (solo cuidadores)</label><input type="number" value={form.grupo_id} onChange={e => setForm({...form, grupo_id: e.target.value})} /></div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => { setModal(false); setEditId(null); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}