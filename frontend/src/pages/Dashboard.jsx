import React, { useEffect, useState } from 'react'
import API from '../api'
import '../styles/Matches.css'

export default function Dashboard() {
  const [balance, setBalance] = useState(null)
  const [upcomingCount, setUpcomingCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [processing, setProcessing] = useState(false)

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

  async function handleDeposit(e) {
    e.preventDefault()
    setProcessing(true)
    try {
      await API.post('mpesa/deposit/', { amount: depositAmount, phone_number: phoneNumber })
      alert('Deposit initiated. Check your M-Pesa for confirmation.')
      setDepositAmount('')
      setPhoneNumber('')
      // Reload balance
      const res = await API.get('me/')
      setBalance(res.data.coins ?? 0)
    } catch (error) {
      alert('Deposit failed: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setProcessing(false)
    }
  }

  async function handleWithdraw(e) {
    e.preventDefault()
    setProcessing(true)
    try {
      await API.post('mpesa/withdraw/', { amount: withdrawAmount })
      alert('Withdrawal initiated.')
      setWithdrawAmount('')
      // Reload balance
      const res = await API.get('me/')
      setBalance(res.data.coins ?? 0)
    } catch (error) {
      alert('Withdrawal failed: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="matches-container">
      <div className="matches-header">
        <h1>Dashboard</h1>
        <p className="matches-subtitle">Overview of your account and upcoming matches</p>
      </div>

      {loading ? (
        <div className="matches-loader">Loading…</div>
      ) : (
        <>
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

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop: '2rem'}}>
            <div className="login-card card">
              <h3>Quick Deposit</h3>
              <form onSubmit={handleDeposit}>
                <input
                  type="number"
                  placeholder="Amount (KES)"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  style={{width: '100%', marginBottom: '0.5rem'}}
                />
                <input
                  type="tel"
                  placeholder="M-Pesa Phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  style={{width: '100%', marginBottom: '0.5rem'}}
                />
                <button type="submit" className="primary" disabled={processing} style={{width: '100%'}}>
                  {processing ? 'Processing...' : 'Deposit'}
                </button>
              </form>
            </div>

            <div className="login-card card">
              <h3>Quick Withdraw</h3>
              <form onSubmit={handleWithdraw}>
                <input
                  type="number"
                  placeholder="Amount (Coins)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={balance}
                  required
                  style={{width: '100%', marginBottom: '0.5rem'}}
                />
                <button type="submit" className="primary" disabled={processing} style={{width: '100%', background: '#ff4444'}}>
                  {processing ? 'Processing...' : 'Withdraw'}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
