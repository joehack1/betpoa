import React, { useEffect, useState } from 'react'

export default function Settings(){
  const [theme, setTheme] = useState('dark')

  useEffect(()=>{
    const t = localStorage.getItem('theme') || 'dark'
    setTheme(t)
    document.body.classList.toggle('light', t === 'light')
  },[])

  function toggle(){
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.body.classList.toggle('light', next === 'light')
  }

  return (
    <div className="matches-container">
      <div className="matches-header">
        <h1>Settings</h1>
        <p className="matches-subtitle">Customize your experience</p>
      </div>

      <div style={{maxWidth:640, margin:'1rem auto', textAlign:'left'}}>
        <div className="login-card">
          <h3>Theme</h3>
          <p>Current: {theme}</p>
          <button className="primary" onClick={toggle}>Toggle Light / Dark</button>
        </div>
      </div>
    </div>
  )
}
