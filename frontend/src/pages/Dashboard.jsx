import React, { useEffect, useState } from 'react'
import API from '../api'
import '../styles/Matches.css'

export default function Dashboard() {
  const [balance, setBalance] = useState(null)
  const [upcomingCount, setUpcomingCount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const [w, ev] = await Promise.all([
          API.get('me/').catch(() => ({ data: { coins: 0 } })),
          API.get('openliga/all/2025/').catch(() => ({ data: { response: [] } })),
        ])
        if (!mounted) return
        setBalance(w.data.coins ?? 0)
        setUpcomingCount((ev.data.response || []).length)
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="matches-container">
      <div className="matches-header">
        <h1>Dashboard</h1>
        <p className="matches-subtitle">Overview of your account and upcoming matches</p>
      </div>

      {loading ? (
        <div className="matches-loader">Loading…</div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div className="login-card card">
            <h3>Balance</h3>
            <p style={{fontSize: '2rem', margin: '0.5rem 0'}}>{balance} coins</p>
          </div>

          <div className="login-card card">
            <h3>Upcoming Matches</h3>
            <p style={{fontSize: '2rem', margin: '0.5rem 0'}}>{upcomingCount ?? 0}</p>
          </div>
        </div>
      )}
    </div>
  )
}
