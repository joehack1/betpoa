import React, {useState} from 'react';
import API from '../api';
export default function Login(){
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const submit = async e =>{
    e.preventDefault();
    try{
      const res = await API.post('token/', {username,password});
      localStorage.setItem('access', res.data.access);
      API.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.access;
      alert('Logged in');
    }catch(err){
      alert('Login failed');
    }
  }
  return (
    <form onSubmit={submit} style={{padding:20}}>
      <h2>Login</h2>
      <div><input value={username} onChange={e=>setUsername(e.target.value)} placeholder='username' /></div>
      <div><input value={password} onChange={e=>setPassword(e.target.value)} placeholder='password' type='password' /></div>
      <button>Login</button>
    </form>
  )
}
