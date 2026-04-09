import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Teams from './pages/Admin/Teams'
import Players from './pages/Admin/Players'
import Games from './pages/Admin/Games'
import Stats from './pages/Admin/Stats'
import Videos from './pages/Admin/Videos'
import ComingSoon from './pages/ComingSoon'
import GameSchedulePage from './pages/GameSchedulePage'
import GameDetailPage from './pages/GameDetailPage'
import ProtectedRoute from './components/ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/teams" element={<ComingSoon />} />
      <Route path="/players" element={<ComingSoon />} />
      <Route path="/schedule" element={<GameSchedulePage />} />
      <Route path="/games/:id" element={<GameDetailPage />} />
      <Route path="/help" element={<ComingSoon />} />
      <Route path="/contact" element={<ComingSoon />} />
      <Route path="/about" element={<ComingSoon />} />
      <Route path="/privacy" element={<ComingSoon />} />
      <Route path="/terms" element={<ComingSoon />} />
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
