import React, { useEffect, useState } from 'react'
import { ScaleLoader } from 'react-spinners'
import API from '../api'
import '../styles/Matches.css'

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
        // Fetch current/future matches (2025 onwards uses date-based filtering)
        const res = await API.get('openliga/bl1/2025/')
        if (!mounted) return
        // API-Football returns { response: [...fixtures] }
        const fixtures = res.data.response || res.data || []
        // Filter to only show matches from today onwards
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const upcomingMatches = fixtures.filter(m => {
          const matchDate = new Date(m.fixture?.date)
          return matchDate >= today
        })
        setMatches(upcomingMatches)
      } catch (err) {
        setError(err.message || 'Failed to load matches')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const getStatusColor = (status) => {
    if (!status) return '#666'
    if (status === 'FT' || status === 'AET') return '#4CAF50' // Green for finished
    if (status === 'PST' || status === 'CANC') return '#f44336' // Red for cancelled
    return '#ff6300' // Orange for live/pending
  }

  const getStatusText = (status) => {
    const statusMap = {
      'NS': 'Not Started',
      'FT': 'Finished',
      'HT': 'Halftime',
      'LIVE': 'Live',
      'AET': 'After Extra Time',
      'PEN': 'Penalties',
      'PST': 'Postponed',
      'CANC': 'Cancelled',
      'ABD': 'Abandoned',
    }
    return statusMap[status] || status
  }

  return (
    <div className="matches-container">
      <div className="matches-header">
        <h1>⚽ Bundesliga Live & Upcoming</h1>
        <p className="matches-subtitle">Current and future matches • Place your bets now</p>
      </div>

      {loading && (
        <div className="matches-loader">
          <ScaleLoader
            barCount={14}
            color="#ff6300"
            height={33}
            margin={3}
            radius={6777}
            speedMultiplier={0.9}
            width={4}
          />
          <p className="loader-text">Loading matches...</p>
        </div>
      )}

      {error && (
        <div className="matches-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="matches-grid">
          {matches.length === 0 ? (
            <div className="no-matches">
              <p>No matches found.</p>
            </div>
          ) : (
            matches.map((m) => (
              <div key={m.fixture?.id || m.id} className="match-card">
                <div className="match-header">
                  <div className="match-round">
                    {m.league?.round || 'Round'}
                  </div>
                  <div 
                    className="match-status" 
                    style={{ backgroundColor: getStatusColor(m.fixture?.status?.short) }}
                  >
                    {getStatusText(m.fixture?.status?.short)}
                  </div>
                </div>

                <div className="match-teams">
                  <div className="team home-team">
                    <img 
                      src={m.teams?.home?.logo} 
                      alt={m.teams?.home?.name} 
                      className="team-logo"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    <span className="team-name">{m.teams?.home?.name}</span>
                  </div>

                  <div className="match-score">
                    <span className="score-number">{m.goals?.home}</span>
                    <span className="score-separator">:</span>
                    <span className="score-number">{m.goals?.away}</span>
                  </div>

                  <div className="team away-team">
                    <span className="team-name">{m.teams?.away?.name}</span>
                    <img 
                      src={m.teams?.away?.logo} 
                      alt={m.teams?.away?.name} 
                      className="team-logo"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                </div>

                <div className="match-details">
                  <div className="detail-item">
                    <span className="detail-label">📅 Date</span>
                    <span className="detail-value">
                      {new Date(m.fixture?.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">⏰ Time</span>
                    <span className="detail-value">
                      {new Date(m.fixture?.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {m.fixture?.venue?.name && (
                    <div className="detail-item">
                      <span className="detail-label">🏟️ Venue</span>
                      <span className="detail-value">{m.fixture.venue.name}</span>
                    </div>
                  )}
                </div>

                <button className="bet-button">Place Bet</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
