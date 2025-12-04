import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Matches from './pages/Matches';
import Login from './pages/Login';
export default function App(){
  return (
    <BrowserRouter>
      <nav style={{padding:10}}>
        <Link to="/">Matches</Link> | <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path='/' element={<Matches/>} />
        <Route path='/login' element={<Login/>} />
      </Routes>
    </BrowserRouter>
  )
}
