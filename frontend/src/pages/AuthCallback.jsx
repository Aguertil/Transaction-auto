import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const token = searchParams.get('token');

    if (token) {
      handled.current = true;
      localStorage.setItem('token', token);
      // Recharge pour synchroniser AuthContext (token + user) sur actedevente.fr
      window.location.replace('/dashboard');
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <div>Connexion en cours...</div>
    </div>
  );
}
