import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Matches from './pages/Matches'
import MyBets from './pages/MyBets'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import './App.css'
import { Navigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'


function App() {
	const [theme, setTheme] = useState('dark')
	useEffect(()=>{
		const t = localStorage.getItem('theme') || 'dark'
		setTheme(t)
		document.body.classList.toggle('light', t === 'light')
	},[])

	function toggleTheme(){
		const next = theme === 'dark' ? 'light' : 'dark'
		setTheme(next)
		localStorage.setItem('theme', next)
		document.body.classList.toggle('light', next === 'light')
	}

	const isAuthenticated = !!localStorage.getItem('access')

	const RequireAuth = ({ children }) => {
		return isAuthenticated ? children : <Navigate to="/login" replace />
	}
return (
<BrowserRouter>
		{/* Decorative animated hexagon background (behind content) */}
		<div className="hex-bg" aria-hidden="true">
			{[...Array(30)].map((_, i) => (
				<div key={i} className={`hex hex-${i % 6}`} />
			))}
		</div>

	{isAuthenticated && (
		<div style={{display:'flex', gap:12, alignItems:'center', marginBottom:16}}>
			<nav style={{display:'flex', gap:8}}>
				<Link className="nav-link" to="/dashboard">Dashboard</Link>
				<Link className="nav-link" to="/matches">Matches</Link>
				<Link className="nav-link" to="/mybets">My Bets</Link>
				<Link className="nav-link" to="/profile">Profile</Link>
				<Link className="nav-link" to="/settings">Settings</Link>
			</nav>
			<div style={{marginLeft:'auto'}}>
				<button onClick={toggleTheme} className="primary" style={{padding:'6px 10px'}}>Toggle Theme</button>
			</div>
		</div>
	)}
  <div className="app-content">
    <Routes>
	<Route path='/' element={<Login />} />
	<Route path='/login' element={<Login />} />
	<Route path='/register' element={<Register />} />
	<Route path='/dashboard' element={<RequireAuth><Dashboard /></RequireAuth>} />
	<Route path='/matches' element={<RequireAuth><Matches /></RequireAuth>} />
	<Route path='/mybets' element={<RequireAuth><MyBets /></RequireAuth>} />
	<Route path='/profile' element={<RequireAuth><Profile /></RequireAuth>} />
	<Route path='/settings' element={<RequireAuth><Settings /></RequireAuth>} />
	<Route path='*' element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
		</Routes>
  </div>
</BrowserRouter>
)
}
export default App