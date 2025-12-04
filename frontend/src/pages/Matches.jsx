import React, { useEffect, useState } from 'react'
import { ScaleLoader } from 'react-spinners'
import API from '../api'
import '../styles/Matches.css'

const mockOdds = {
  home: 2.10,
  draw: 3.20,
  away: 2.50
}

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
        // Fetch aggregated events from TheSportsDB via backend proxy.
        const res = await API.get('openliga/all/2025/')
        if (!mounted) return
        // The backend returns { response: [ ...events ] }
        const events = res.data.response || []

        // Filter events to start from 2025-12-01 onward
        const startDate = new Date(2025, 11, 1) // Dec 1, 2025 (month is 0-based)
        const filtered = events.filter(ev => {
          // prefer ISO timestamp, otherwise combine dateEvent + strTime
          let dt = null
          if (ev.strTimestamp) dt = new Date(ev.strTimestamp)
          else if (ev.dateEvent && ev.strTime) dt = new Date(`${ev.dateEvent}T${ev.strTime}`)
          else if (ev.dateEvent) dt = new Date(ev.dateEvent)
          if (!dt || isNaN(dt)) return false
          return dt >= startDate
        })

        setMatches(filtered)
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

  const placeBet = async (match, choice) => {
    const amount = prompt(`Enter bet amount for ${choice} (coins):`)
    if (!amount || isNaN(amount) || amount <= 0) return

    try {
      // Create match if not exists (simplified)
      const matchData = {
        home: match.strHomeTeam,
        away: match.strAwayTeam,
        start_time: match.strTimestamp || `${match.dateEvent}T${match.strTime}`,
        sport: 'football'
      }
      // Assume match creation endpoint or use existing
      const res = await API.post('matches/', matchData)
      const matchId = res.data.id

      await API.post('bets/', {
        match_id: matchId,
        amount: parseInt(amount),
        choice
      })
      alert('Bet placed successfully!')
    } catch (err) {
      alert('Failed to place bet: ' + err.message)
    }
  }

  return (
    <div className="matches-container">
      <div className="matches-header">
        <h1>⚽ Live & Upcoming — All Leagues</h1>
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
            matches.map((m) => {
              const key = m.idEvent || m.id || Math.random()
              // build datetime
              let dt = null
              if (m.strTimestamp) dt = new Date(m.strTimestamp)
              else if (m.dateEvent && m.strTime) dt = new Date(`${m.dateEvent}T${m.strTime}`)
              else if (m.dateEvent) dt = new Date(m.dateEvent)

              return (
                <div key={key} className="match-card">
                  <div className="match-header">
                    <div className="match-round">
                      {m.strRound || m.intRound || 'Round'}
                    </div>
                    <div className="match-status" style={{ backgroundColor: getStatusColor(m.strStatus) }}>
                      {m.strStatus || 'Not Started'}
                    </div>
                  </div>

                  <div className="match-teams">
                    <div className="team home-team">
                      {m.strHomeTeamBadge && (
                        <img src={m.strHomeTeamBadge} alt={m.strHomeTeam} className="team-logo" onError={(e) => e.target.style.display = 'none'} />
                      )}
                      <span className="team-name">{m.strHomeTeam}</span>
                    </div>

                    <div className="match-score">
                      <span className="score-number">{m.intHomeScore ?? '-'}</span>
                      <span className="score-separator">:</span>
                      <span className="score-number">{m.intAwayScore ?? '-'}</span>
                    </div>

                    <div className="team away-team">
                      <span className="team-name">{m.strAwayTeam}</span>
                      {m.strAwayTeamBadge && (
                        <img src={m.strAwayTeamBadge} alt={m.strAwayTeam} className="team-logo" onError={(e) => e.target.style.display = 'none'} />
                      )}
                    </div>
                  </div>

                  <div className="match-details">
                    <div className="detail-item">
                      <span className="detail-label">📅 Date</span>
                      <span className="detail-value">
                        {dt ? dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : m.dateEvent}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">⏰ Time</span>
                      <span className="detail-value">{dt ? dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : (m.strTime || '-')}</span>
                    </div>
                    {m.strVenue && (
                      <div className="detail-item">
                        <span className="detail-label">🏟️ Venue</span>
                        <span className="detail-value">{m.strVenue}</span>
                      </div>
                    )}
                    {m.strLeague && (
                      <div className="detail-item">
                        <span className="detail-label">🏷️ League</span>
                        <span className="detail-value">{m.strLeague}</span>
                      </div>
                    )}
                  </div>

                  <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                    <button className="bet-button" onClick={() => placeBet(m, 'home')}>
                      Home<br/>{mockOdds.home}
                    </button>
                    <button className="bet-button" onClick={() => placeBet(m, 'draw')}>
                      Draw<br/>{mockOdds.draw}
                    </button>
                    <button className="bet-button" onClick={() => placeBet(m, 'away')}>
                      Away<br/>{mockOdds.away}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
