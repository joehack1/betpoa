import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Matches from './pages/Matches'
import MyBets from './pages/MyBets'


function App() {
return (
<BrowserRouter>
<Routes>
<Route path='/' element={<Matches />} />
<Route path='/login' element={<Login />} />
<Route path='/register' element={<Register />} />
<Route path='/mybets' element={<MyBets />} />
</Routes>
</BrowserRouter>
)
}
export default App