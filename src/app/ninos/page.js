'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API_URL from '@/api';
import { Search } from 'lucide-react';

export default function NinosPage() {
  const router = useRouter();
  const [ninos, setNinos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [modal, setModal] = useState(false);
  const [detalleModal, setDetalleModal] = useState(false);
  const [paso, setPaso] = useState(1);
  const [editId, setEditId] = useState(null);
  const [rolId, setRolId] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [pestana, setPestana] = useState('info');
  const [ninoActual, setNinoActual] = useState(null);
  const [alergias, setAlergias] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [acudientes, setAcudientes] = useState([]);


  const [nino, setNino] = useState({
    nombre: '', apellido: '', fecha_nacimiento: '',
    genero: 'masculino', grupo: 'caminadores', grupo_id: ''
  });

  const [acudiente, setAcudiente] = useState({
    nombre: '', apellido: '', dni: '', telefono: '',
    telefono_emergencia: '', email: '', relacion: 'padre'
  });

  const [editForm, setEditForm] = useState({
    nombre: '', apellido: '', fecha_nacimiento: '',
    genero: 'masculino', grupo: '', grupo_id: ''
  });

  const [nuevaAlergia, setNuevaAlergia] = useState({ tipo: '', descripcion: '', severidad: 'moderada' });
  const [nuevaVacuna, setNuevaVacuna] = useState({ nombre: '', fecha_aplicacion: '', proxima_dosis: '', notas: '' });

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) router.push('/login');
    const rol = parseInt(localStorage.getItem('rol_id'));
    const grupo = parseInt(localStorage.getItem('grupo_id'));
    setRolId(rol);
    fetchNinos(rol, grupo);
    fetchGrupos();
  }, []);

  const fetchGrupos = async () => {
    const res = await fetch(`${API_URL}/grupos/get_grupos`);
    setGrupos(await res.json());
  };

  const fetchNinos = async (rol, grupo) => {
    let url = `${API_URL}/ninos/get_ninos`;
    if (rol === 2 && grupo) url = `${API_URL}/ninos/get_ninos_by_grupo/${grupo}`;
    const res = await fetch(url);
    setNinos(await res.json());
  };

  const fetchDetalle = async (n) => {
    setNinoActual(n);
    setPestana('info');
    const [a, v, ac] = await Promise.all([
      fetch(`${API_URL}/alergias/get_by_nino/${n.id}`).then(r => r.json()),
      fetch(`${API_URL}/vacunas/get_by_nino/${n.id}`).then(r => r.json()),
      fetch(`${API_URL}/nino-acudiente/get_by_nino/${n.id}`).then(r => r.json()),
    ]);
    setAlergias(a);
    setVacunas(v);
    setAcudientes(ac);
    setDetalleModal(true);
  };

  const handleGrupoChange = (valor, isEdit = false) => {
    const g = grupos.find(g => g.id === parseInt(valor));
    if (isEdit) {
      setEditForm({ ...editForm, grupo_id: parseInt(valor), grupo: g?.nombre || '' });
    } else {
      setNino({ ...nino, grupo_id: parseInt(valor), grupo: g?.nombre || '' });
    }
  };

  const handleRegistrar = async () => {
    const res = await fetch(`${API_URL}/ninos/registrar_completo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nino, acudiente })
    });
    const data = await res.json();
    if (data.resultado) {
      setModal(false); setPaso(1);
      setNino({ nombre: '', apellido: '', fecha_nacimiento: '', genero: 'masculino', grupo: '', grupo_id: '' });
      setAcudiente({ nombre: '', apellido: '', dni: '', telefono: '', telefono_emergencia: '', email: '', relacion: 'padre' });
      const rol = parseInt(localStorage.getItem('rol_id'));
      const grupo = parseInt(localStorage.getItem('grupo_id'));
      fetchNinos(rol, grupo);
    }
  };

  const handleEdit = (n) => {
    setEditForm({ nombre: n.nombre, apellido: n.apellido, fecha_nacimiento: n.fecha_nacimiento, genero: n.genero, grupo: n.grupo, grupo_id: n.grupo_id });
    setEditId(n.id); setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/ninos/update_nino/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setEditModal(false); setEditId(null);
    const rol = parseInt(localStorage.getItem('rol_id'));
    const grupo = parseInt(localStorage.getItem('grupo_id'));
    fetchNinos(rol, grupo);
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este nino?')) return;
    await fetch(`${API_URL}/ninos/delete_nino/${id}`, { method: 'DELETE' });
    const rol = parseInt(localStorage.getItem('rol_id'));
    const grupo = parseInt(localStorage.getItem('grupo_id'));
    fetchNinos(rol, grupo);
  };

  const agregarAlergia = async () => {
    if (!nuevaAlergia.tipo || !nuevaAlergia.descripcion) return;
    await fetch(`${API_URL}/alergias/create_alergia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nuevaAlergia, nino_id: ninoActual.id })
    });
    setNuevaAlergia({ tipo: '', descripcion: '', severidad: 'moderada' });
    const res = await fetch(`${API_URL}/alergias/get_by_nino/${ninoActual.id}`);
    setAlergias(await res.json());
  };

  const eliminarAlergia = async (id) => {
    await fetch(`${API_URL}/alergias/delete_alergia/${id}`, { method: 'DELETE' });
    const res = await fetch(`${API_URL}/alergias/get_by_nino/${ninoActual.id}`);
    setAlergias(await res.json());
  };

  const agregarVacuna = async () => {
    if (!nuevaVacuna.nombre || !nuevaVacuna.fecha_aplicacion) return;
    await fetch(`${API_URL}/vacunas/create_vacuna`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nuevaVacuna, nino_id: ninoActual.id })
    });
    setNuevaVacuna({ nombre: '', fecha_aplicacion: '', proxima_dosis: '', notas: '' });
    const res = await fetch(`${API_URL}/vacunas/get_by_nino/${ninoActual.id}`);
    setVacunas(await res.json());
  };

  const eliminarVacuna = async (id) => {
    await fetch(`${API_URL}/vacunas/delete_vacuna/${id}`, { method: 'DELETE' });
    const res = await fetch(`${API_URL}/vacunas/get_by_nino/${ninoActual.id}`);
    setVacunas(await res.json());
  };

  const severidadBadge = (s) => {
    if (s === 'severa') return 'badge-red';
    if (s === 'moderada') return 'badge-yellow';
    return 'badge-green';
  };

  const canEdit = rolId === 1 || rolId === 2;

  const ninosFiltrados = ninos.filter(n =>
    `${n.nombre} ${n.apellido}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <>
      <div className="topbar">
        <h1>Niños</h1>
        {canEdit && <button className="btn btn-primary" onClick={() => { setModal(true); setPaso(1); }}>+ Registrar Nino</button>}
      </div>
      <div
        style={{
          marginBottom: '20px',
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
        }}
      >
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
          }}
        />

        <input
          type="text"
          placeholder="Buscar por nombre o apellido..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px 12px 42px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            background: '#fff',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
            color: '#0f172a',
          }}
          onFocus={(e) => {
            e.target.style.border = '1px solid #3b82f6';
            e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.12)';
          }}
          onBlur={(e) => {
            e.target.style.border = '1px solid #e2e8f0';
            e.target.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.05)';
          }}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {/* <th>ID</th> */}
              <th>Nombre</th><th>Apellido</th><th>Nacimiento</th><th>Genero</th><th>Grupo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {ninosFiltrados.length === 0 ? (
              <tr><td colSpan={7} className="empty-state">No hay ninos registrados</td></tr>
            ) : ninosFiltrados.map(n => (
              <tr key={n.id}>
                {/* <td>{n.id}</td> */}
                <td>{n.nombre}</td><td>{n.apellido}</td>
                <td>{n.fecha_nacimiento}</td>
                <td><span className="badge badge-blue">{n.genero}</span></td>
                <td><span className="badge badge-green">{n.grupo}</span></td>
                <td style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => fetchDetalle(n)}>Ver detalle</button>
                  {canEdit && <button className="btn btn-warning" onClick={() => handleEdit(n)}>Editar</button>}
                  {rolId === 1 && <button className="btn btn-danger" onClick={() => handleDelete(n.id)}>Eliminar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal detalle con pestanas */}
      {detalleModal && ninoActual && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>{ninoActual.nombre} {ninoActual.apellido}</h2>
              <button className="btn" onClick={() => setDetalleModal(false)}>Cerrar</button>
            </div>

            {/* Pestanas */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '2px solid #e2e8f0' }}>
              {['info', 'acudientes', 'alergias', 'vacunas'].map(p => (
                <button key={p} onClick={() => setPestana(p)} style={{
                  padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: '13px',
                  fontWeight: pestana === p ? '600' : '400',
                  color: pestana === p ? '#2563eb' : '#64748b',
                  borderBottom: pestana === p ? '2px solid #2563eb' : '2px solid transparent',
                  background: 'none', marginBottom: '-2px'
                }}>
                  {p === 'info' ? 'Informacion'
                    : p === 'acudientes' ? `Acudientes (${acudientes.length})`
                      : p === 'alergias' ? `Alergias (${alergias.length})`
                        : `Vacunas (${vacunas.length})`}
                </button>
              ))}
            </div>

            {/* Pestana Info */}
            {pestana === 'info' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  ['Nombre', `${ninoActual.nombre} ${ninoActual.apellido}`],
                  ['Nacimiento', ninoActual.fecha_nacimiento],
                  ['Genero', ninoActual.genero],
                  ['Grupo', ninoActual.grupo],
                  ['Tipo Sangre', ninoActual.tipo_sangre || '-'],
                  ['Medico', ninoActual.medico_nombre || '-'],
                  ['Tel. Medico', ninoActual.medico_telefono || '-'],
                  ['Seguro', ninoActual.seguro_medico || '-'],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: '#f8fafc', borderRadius: '6px', padding: '10px 12px' }}>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px', textTransform: 'uppercase' }}>{label}</p>
                    <p style={{ fontSize: '14px', color: '#1e3a5f', fontWeight: '500' }}>{value}</p>
                  </div>
                ))}
                {ninoActual.observaciones_medicas && (
                  <div style={{ gridColumn: '1/-1', background: '#f8fafc', borderRadius: '6px', padding: '10px 12px' }}>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px', textTransform: 'uppercase' }}>Observaciones</p>
                    <p style={{ fontSize: '14px', color: '#1e3a5f' }}>{ninoActual.observaciones_medicas}</p>
                  </div>
                )}
              </div>
            )}

            {pestana === 'acudientes' && (
              <>
                {acudientes.length === 0 ? (
                  <p className="empty-state">No hay acudientes registrados</p>
                ) : acudientes.map(a => (
                  <div key={a.id} style={{
                    background: '#f8fafc', borderRadius: '8px',
                    padding: '12px 16px', marginBottom: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e3a5f' }}>
                        {a.nombre} {a.apellido}
                      </p>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span className="badge badge-blue">{a.relacion}</span>
                        {a.es_contacto_principal && <span className="badge badge-green">Principal</span>}
                        {a.puede_recoger && <span className="badge badge-yellow">Puede recoger</span>}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {[
                        ['Telefono', a.telefono || '-'],
                        ['Emergencia', a.telefono_emergencia || '-'],
                        ['Email', a.email || '-'],
                        ['DNI', a.dni || '-'],
                      ].map(([label, value]) => (
                        <p key={label} style={{ fontSize: '13px', color: '#475569' }}>
                          <span style={{ color: '#94a3b8' }}>{label}: </span>{value}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Pestana Alergias */}
            {pestana === 'alergias' && (
              <>
                {canEdit && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    <input placeholder="Tipo (ej: alimentaria)" value={nuevaAlergia.tipo} onChange={e => setNuevaAlergia({ ...nuevaAlergia, tipo: e.target.value })}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                    <select value={nuevaAlergia.severidad} onChange={e => setNuevaAlergia({ ...nuevaAlergia, severidad: e.target.value })}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}>
                      <option value="leve">Leve</option>
                      <option value="moderada">Moderada</option>
                      <option value="severa">Severa</option>
                    </select>
                    <input placeholder="Descripcion" value={nuevaAlergia.descripcion} onChange={e => setNuevaAlergia({ ...nuevaAlergia, descripcion: e.target.value })}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', gridColumn: '1/-1' }} required />
                    <button className="btn btn-primary" onClick={agregarAlergia} style={{ gridColumn: '1/-1' }}>Agregar Alergia</button>
                  </div>
                )}
                {alergias.length === 0 ? (
                  <p className="empty-state">No hay alergias registradas</p>
                ) : alergias.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e3a5f' }}>{a.tipo}</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{a.descripcion}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${severidadBadge(a.severidad)}`}>{a.severidad}</span>
                      {canEdit && <button className="btn btn-danger" onClick={() => eliminarAlergia(a.id)}>Quitar</button>}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Pestana Vacunas */}
            {pestana === 'vacunas' && (
              <>
                {canEdit && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    <input placeholder="Nombre vacuna" value={nuevaVacuna.nombre} onChange={e => setNuevaVacuna({ ...nuevaVacuna, nombre: e.target.value })}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                    <input type="date" placeholder="Fecha aplicacion" value={nuevaVacuna.fecha_aplicacion} onChange={e => setNuevaVacuna({ ...nuevaVacuna, fecha_aplicacion: e.target.value })}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                    <input type="date" placeholder="Proxima dosis" value={nuevaVacuna.proxima_dosis} onChange={e => setNuevaVacuna({ ...nuevaVacuna, proxima_dosis: e.target.value })}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                    <input placeholder="Notas" value={nuevaVacuna.notas} onChange={e => setNuevaVacuna({ ...nuevaVacuna, notas: e.target.value })}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                    <button className="btn btn-primary" onClick={agregarVacuna} style={{ gridColumn: '1/-1' }}>Agregar Vacuna</button>
                  </div>
                )}
                {vacunas.length === 0 ? (
                  <p className="empty-state">No hay vacunas registradas</p>
                ) : vacunas.map(v => (
                  <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e3a5f' }}>{v.nombre}</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>Aplicada: {v.fecha_aplicacion}</p>
                      {v.proxima_dosis && <p style={{ fontSize: '12px', color: '#2563eb' }}>Proxima: {v.proxima_dosis}</p>}
                    </div>
                    {canEdit && <button className="btn btn-danger" onClick={() => eliminarVacuna(v.id)}>Quitar</button>}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal registro en pasos */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[1, 2, 3].map(p => (
                <div key={p} style={{ flex: 1, height: '4px', borderRadius: '2px', background: paso >= p ? '#2563eb' : '#e2e8f0' }} />
              ))}
            </div>

            {paso === 1 && (
              <>
                <h2>Paso 1 — Datos del Nino</h2>
                <div className="form-group"><label>Nombre</label><input value={nino.nombre} onChange={e => setNino({ ...nino, nombre: e.target.value })} required /></div>
                <div className="form-group"><label>Apellido</label><input value={nino.apellido} onChange={e => setNino({ ...nino, apellido: e.target.value })} required /></div>
                <div className="form-group"><label>Fecha de Nacimiento</label><input type="date" value={nino.fecha_nacimiento} onChange={e => setNino({ ...nino, fecha_nacimiento: e.target.value })} required /></div>
                <div className="form-group">
                  <label>Genero</label>
                  <select value={nino.genero} onChange={e => setNino({ ...nino, genero: e.target.value })}>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Grupo</label>
                  <select value={nino.grupo_id ?? ''} onChange={e => handleGrupoChange(e.target.value)}>
                    <option value="">Selecciona un grupo</option>
                    {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                  </select>
                </div>
                <div className="form-actions">
                  <button className="btn" onClick={() => { setModal(false); setPaso(1); }}>Cancelar</button>
                  <button className="btn btn-primary" onClick={() => { if (nino.nombre && nino.apellido && nino.fecha_nacimiento) setPaso(2); }}>Siguiente</button>
                </div>
              </>
            )}

            {paso === 2 && (
              <>
                <h2>Paso 2 — Acudiente Principal</h2>
                <div className="form-group"><label>Nombre</label><input value={acudiente.nombre} onChange={e => setAcudiente({ ...acudiente, nombre: e.target.value })} required /></div>
                <div className="form-group"><label>Apellido</label><input value={acudiente.apellido} onChange={e => setAcudiente({ ...acudiente, apellido: e.target.value })} required /></div>
                <div className="form-group"><label>DNI</label><input value={acudiente.dni} onChange={e => setAcudiente({ ...acudiente, dni: e.target.value })} /></div>
                <div className="form-group"><label>Telefono</label><input value={acudiente.telefono} onChange={e => setAcudiente({ ...acudiente, telefono: e.target.value })} /></div>
                <div className="form-group"><label>Telefono Emergencia</label><input value={acudiente.telefono_emergencia} onChange={e => setAcudiente({ ...acudiente, telefono_emergencia: e.target.value })} /></div>
                <div className="form-group"><label>Email</label><input type="email" value={acudiente.email} onChange={e => setAcudiente({ ...acudiente, email: e.target.value })} /></div>
                <div className="form-group">
                  <label>Relacion</label>
                  <select value={acudiente.relacion} onChange={e => setAcudiente({ ...acudiente, relacion: e.target.value })}>
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
                  <button className="btn" onClick={() => setPaso(1)}>Atras</button>
                  <button className="btn btn-primary" onClick={() => { if (acudiente.nombre && acudiente.apellido) setPaso(3); }}>Siguiente</button>
                </div>
              </>
            )}

            {paso === 3 && (
              <>
                <h2>Paso 3 — Confirmacion</h2>
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                  <p style={{ fontWeight: '600', color: '#1e3a5f', marginBottom: '8px' }}>Datos del Nino</p>
                  <p style={{ fontSize: '14px', color: '#475569' }}>{nino.nombre} {nino.apellido}</p>
                  <p style={{ fontSize: '14px', color: '#475569' }}>Nacimiento: {nino.fecha_nacimiento}</p>
                  <p style={{ fontSize: '14px', color: '#475569' }}>Grupo: {nino.grupo}</p>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                  <p style={{ fontWeight: '600', color: '#1e3a5f', marginBottom: '8px' }}>Acudiente Principal</p>
                  <p style={{ fontSize: '14px', color: '#475569' }}>{acudiente.nombre} {acudiente.apellido}</p>
                  <p style={{ fontSize: '14px', color: '#475569' }}>Telefono: {acudiente.telefono || '-'}</p>
                  <p style={{ fontSize: '14px', color: '#475569' }}>Relacion: {acudiente.relacion}</p>
                </div>
                <div className="form-actions">
                  <button className="btn" onClick={() => setPaso(2)}>Atras</button>
                  <button className="btn btn-primary" onClick={handleRegistrar}>Confirmar y Registrar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal editar */}
      {editModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Editar Nino</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group"><label>Nombre</label><input value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} required /></div>
              <div className="form-group"><label>Apellido</label><input value={editForm.apellido} onChange={e => setEditForm({ ...editForm, apellido: e.target.value })} required /></div>
              <div className="form-group"><label>Fecha de Nacimiento</label><input type="date" value={editForm.fecha_nacimiento} onChange={e => setEditForm({ ...editForm, fecha_nacimiento: e.target.value })} required /></div>
              <div className="form-group">
                <label>Genero</label>
                <select value={editForm.genero} onChange={e => setEditForm({ ...editForm, genero: e.target.value })}>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Grupo</label>
                <select value={editForm.grupo_id ?? ''} onChange={e => handleGrupoChange(e.target.value, true)}>
                  <option value="">Selecciona un grupo</option>
                  {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => { setEditModal(false); setEditId(null); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}