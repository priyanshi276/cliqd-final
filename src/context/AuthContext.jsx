import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set auth token helper
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('cliqd_token', token);
    } else {
      localStorage.removeItem('cliqd_token');
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.cliqd_token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'x-auth-token': localStorage.cliqd_token }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            setAuthToken(null);
          }
        } catch (err) {
          console.error(err);
          setAuthToken(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const register = async ({ name, email, password, username }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, username })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.msg || 'Registration failed');
    }
    
    const data = await res.json();
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async ({ email, password }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.msg || 'Login failed');
    }

    const data = await res.json();
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.cliqd_token 
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const refreshUser = async () => {
    if (localStorage.cliqd_token) {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'x-auth-token': localStorage.cliqd_token }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getUsers = () => { return {}; }; // Mock for backwards compatibility if needed internally

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshUser, getUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
