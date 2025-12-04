import React, { useEffect, useState } from 'react'
import API from '../api'

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        // default to Bundesliga 2021 as example — adjust as needed
        const res = await API.get('openliga/bl1/2021/')
        if (!mounted) return
        setMatches(res.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load matches')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <h1>Matches</h1>
      {loading && <p>Loading matches…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ul>
          {matches.length === 0 && <li>No matches found.</li>}
          {matches.map((m) => (
            <li key={m.MatchID}>
              <strong>{m.Team1?.TeamName} vs {m.Team2?.TeamName}</strong>
              <div>Time: {m.MatchDateTimeUTC}</div>
              <div>Status: {m.MatchIsFinished ? 'Finished' : 'Upcoming'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
