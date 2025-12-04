import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Matches from './pages/Matches'
import MyBets from './pages/MyBets'
import './App.css'
import { Navigate } from 'react-router-dom'


function App() {
return (
<BrowserRouter>
<Routes>
	<Route path='/' element={<Login />} />
	<Route path='/login' element={<Login />} />
	<Route path='/register' element={<Register />} />
	<Route path='/matches' element={<Matches />} />
	<Route path='/mybets' element={<MyBets />} />
	<Route path='*' element={<Navigate to='/' replace />} />
</Routes>
</BrowserRouter>
)
}
export default App