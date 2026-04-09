import { useParams, Navigate } from 'react-router-dom'
import { Navbar } from '../components/Layout/Navbar'
import { Footer } from '../components/Layout/Footer'
import { SEO } from '../components/seo'

function TeamPage() {
  const { id } = useParams<{ id: string }>()
  const teamId = id ? parseInt(id, 10) : NaN

  if (Number.isNaN(teamId) || teamId <= 0) {
    return <Navigate to="/404" replace />
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <SEO title="球队详情" description="Joyful Baseball League 球队信息" />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#041E42] to-[#0A2A5A] p-8 text-white">
          <h1 className="text-3xl font-bold">球队详情 (ID: {teamId})</h1>
          <p className="mt-2 text-white/80">页面建设中...</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default TeamPage
