'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn } from 'lucide-react';
import API_URL from '@/api';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('usuario_id', data.usuario_id);
      localStorage.setItem('nombre', data.nombre);
      localStorage.setItem('apellido', data.apellido);
      localStorage.setItem('rol_id', String(data.rol_id));
      localStorage.setItem('grupo_id', String(data.grupo_id));
      localStorage.setItem('isLoggedIn', 'true');

      router.push('/');
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        padding: '20px'
      }}
    >
      <div
        className="login-card"
        style={{
          width: '100%',
          maxWidth: '430px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '28px',
          padding: '38px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)'
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '28px'
          }}
        >
          <div
            style={{
              width: '82px',
              height: '82px',
              borderRadius: '22px',
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              marginBottom: '18px'
            }}
          >
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                width: '78%',
                height: '78%',
                objectFit: 'contain'
              }}
            />
          </div>

          <h1
            style={{
              color: '#fff',
              fontSize: '30px',
              fontWeight: '700',
              marginBottom: '8px'
            }}
          >
            Guardería
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '14px',
              textAlign: 'center',
              lineHeight: '1.5'
            }}
          >
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#fecaca',
              padding: '12px',
              borderRadius: '12px',
              marginBottom: '18px',
              fontSize: '14px',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin}>
          {/* EMAIL */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                color: 'rgba(255,255,255,0.8)',
                marginBottom: '8px',
                fontSize: '14px'
              }}
            >
              Correo electrónico
            </label>

            <div
              style={{
                position: 'relative'
              }}
            >
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />

              <input
                type="email"
                placeholder="admin@guarderia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 44px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                color: 'rgba(255,255,255,0.8)',
                marginBottom: '8px',
                fontSize: '14px'
              }}
            >
              Contraseña
            </label>

            <div
              style={{
                position: 'relative'
              }}
            >
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 44px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: '14px',
              padding: '14px',
              background:
                'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: '0.2s ease',
              boxShadow: '0 10px 25px rgba(37,99,235,0.35)'
            }}
          >
            <LogIn size={18} />

            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}