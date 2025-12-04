import React, {useEffect, useState} from 'react';
import API from '../api';
export default function Matches(){
  const [matches, setMatches] = useState([]);
  useEffect(()=>{
    API.get('matches/').then(r=>setMatches(r.data)).catch(e=>console.log(e));
  },[]);
  return (
    <div style={{padding:20}}>
      <h1>Matches</h1>
      <ul>
        {matches.map(m=> (
          <li key={m.id}>{m.home} vs {m.away} - {new Date(m.start_time).toLocaleString()}</li>
        ))}
      </ul>
      {matches.length===0 && <p>No upcoming matches (seed some via Django admin).</p>}
    </div>
  )
}
