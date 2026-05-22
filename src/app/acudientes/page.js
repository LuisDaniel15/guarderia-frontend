'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API_URL from '@/api';

export default function AcudientesPage() {
  const router = useRouter();
  const [items, setItems]   = useState([]);
  const [modal, setModal]   = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState({ nombre: '', apellido: '', telefono: '', email: '', relacion: 'padre' });

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) router.push('/login');
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch(`${API_URL}/acudientes/get_acudientes`);
    setItems(await res.json());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url    = editId ? `${API_URL}/acudientes/update_acudiente/${editId}` : `${API_URL}/acudientes/create_acudiente`;
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setModal(false); setEditId(null);
    setForm({ nombre: '', apellido: '', telefono: '', email: '', relacion: 'padre' });
    fetchData();
  };

  const handleEdit = (item) => {
    setForm({ nombre: item.nombre, apellido: item.apellido, telefono: item.telefono, email: item.email, relacion: item.relacion });
    setEditId(item.id); setModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este acudiente?')) return;
    await fetch(`${API_URL}/acudientes/delete_acudiente/${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <>
      <div className="topbar">
        <h1>Acudientes</h1>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Agregar</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {/* <th>ID</th> */}
              <th>Nombre</th><th>Apellido</th><th>Telefono</th><th>Email</th><th>Relacion</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} className="empty-state">No hay acudientes registrados</td></tr>
            ) : items.map(i => (
              <tr key={i.id}>
                {/* <td>{i.id}</td> */}
                <td>{i.nombre}</td><td>{i.apellido}</td>
                <td>{i.telefono}</td><td>{i.email}</td>
                <td><span className="badge badge-blue">{i.relacion}</span></td>
                <td style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-warning" onClick={() => handleEdit(i)}>Editar</button>
                  <button className="btn btn-danger"  onClick={() => handleDelete(i.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editId ? 'Editar Acudiente' : 'Agregar Acudiente'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Nombre</label><input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required /></div>
              <div className="form-group"><label>Apellido</label><input value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} required /></div>
              <div className="form-group"><label>Telefono</label><input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="form-group">
                <label>Relacion</label>
                <select value={form.relacion} onChange={e => setForm({...form, relacion: e.target.value})}>
                  <option value="padre">Padre</option>
                  <option value="madre">Madre</option>
                  <option value="abuelo">Abuelo</option>
                  <option value="abuela">Abuela</option>
                  <option value="tio">Tio</option>
                  <option value="tia">Tia</option>
                  <option value="tutor_legal">Tutor Legal</option>
                  <option value="otro">Otro</option>
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
    </>
  );
}