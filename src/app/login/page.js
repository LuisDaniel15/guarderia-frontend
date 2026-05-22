'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API_URL from '@/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Credenciales incorrectas');
        return;
      }

      localStorage.setItem('token',      data.access_token);
      localStorage.setItem('usuario_id', data.usuario_id);
      localStorage.setItem('nombre',     data.nombre);
      localStorage.setItem('apellido',     data.apellido);
      localStorage.setItem('rol_id',     String(data.rol_id));
      localStorage.setItem('grupo_id',   String(data.grupo_id));
      localStorage.setItem('isLoggedIn', 'true');

      router.push('/');
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Guarderia</h1>
        <p>Ingresa tus credenciales para continuar</p>
        {error && (
          <p style={{ color: 'red', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
            {error}
          </p>
        )}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Correo electronico</label>
            <input type="email" placeholder="admin@guarderia.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Contrasena</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesion'}
          </button>
        </form>
      </div>
    </div>
  );
}