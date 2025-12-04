import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (role === 'admin') {
      // Redirect to Django admin (session login)
      window.location.href = '/admin/'
      return
    }

    setLoading(true)
    try {
      const res = await API.post('token/', { username, password })
      localStorage.setItem('access', res.data.access)
      localStorage.setItem('refresh', res.data.refresh)
      // navigate to dashboard after login
      navigate('/dashboard')
    } catch (err) {
      const resp = err.response && err.response.data ? JSON.stringify(err.response.data) : null
      setError(resp || err.response?.statusText || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="brand">BETPOA</h2>
        <p className="subtitle">Sign in to your account</p>

        <div className="role-toggle">
          <button
            className={role === 'user' ? 'active' : ''}
            onClick={() => setRole('user')}
          >User</button>
          <button
            className={role === 'admin' ? 'active' : ''}
            onClick={() => setRole('admin')}
          >Admin</button>
        </div>

        <form onSubmit={submit} className="login-form">
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <div className="error">{error}</div>}

          <button className="primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : role === 'admin' ? 'Go to Admin' : 'Sign In'}</button>
        </form>

        <div className="register-row">
          <span>New here?</span>
          <a href="/register">Create account</a>
        </div>
      </div>
    </div>
  )
}
