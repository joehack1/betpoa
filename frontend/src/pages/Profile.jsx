import React, { useEffect, useState } from 'react'
import API from '../api'

export default function Profile(){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted=true
    async function load(){
      try{
        const res = await API.get('me/')
        if(!mounted) return
        setUser(res.data)
      }catch(e){ }
      finally{ if(mounted) setLoading(false) }
    }
    load()
    return ()=>{ mounted=false }
  },[])

  if(loading) return <div className="matches-container"><p>Loading profile…</p></div>

  return (
    <div className="matches-container">
      <div className="matches-header">
        <h1>Profile</h1>
        <p className="matches-subtitle">Manage your account</p>
      </div>
      <div style={{maxWidth:560, margin:'1rem auto', textAlign:'left'}}>
        <div className="login-card">
          <h3>Username</h3>
          <p>{user.username}</p>
          <h3>Email</h3>
          <p>{user.email || '—'}</p>
          <h3>Balance</h3>
          <p>{user.coins ?? 0} coins</p>
        </div>
      </div>
    </div>
  )
}
