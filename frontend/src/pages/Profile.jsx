import React, { useEffect, useState } from 'react'
import API from '../api'

export default function Profile(){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [transactions, setTransactions] = useState([])
  const [processing, setProcessing] = useState(false)

  useEffect(()=>{
    let mounted=true
    async function load(){
      try{
        const res = await API.get('me/')
        if(!mounted) return
        setUser(res.data)
        const txRes = await API.get('mpesa/transactions/')
        setTransactions(txRes.data)
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

        <div className="login-card" style={{marginTop: '2rem'}}>
          <h3>Deposit Coins</h3>
          <form onSubmit={handleDeposit}>
            <input
              type="number"
              placeholder="Amount (KES)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="M-Pesa Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <button type="submit" className="primary" disabled={processing}>
              {processing ? 'Processing...' : 'Deposit'}
            </button>
          </form>
        </div>

        <div className="login-card" style={{marginTop: '2rem'}}>
          <h3>Withdraw Coins</h3>
          <form onSubmit={handleWithdraw}>
            <input
              type="number"
              placeholder="Amount (Coins)"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              max={user.coins}
              required
            />
            <button type="submit" className="primary" disabled={processing} style={{background: '#ff4444'}}>
              {processing ? 'Processing...' : 'Withdraw'}
            </button>
          </form>
        </div>

        <div className="login-card" style={{marginTop: '2rem'}}>
          <h3>Transaction History</h3>
          <ul>
            {transactions.map((tx) => (
              <li key={tx.id}>
                {tx.transaction_type} - {tx.amount} KES - {tx.status}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
