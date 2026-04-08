import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Teams from './pages/Admin/Teams'
import Players from './pages/Admin/Players'
import Games from './pages/Admin/Games'
import Stats from './pages/Admin/Stats'
import Videos from './pages/Admin/Videos'
import ProtectedRoute from './components/ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/teams" element={<Teams />} />
        <Route path="/admin/players" element={<Players />} />
        <Route path="/admin/games" element={<Games />} />
        <Route path="/admin/stats" element={<Stats />} />
        <Route path="/admin/videos" element={<Videos />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
