import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Navbar } from '../components/Layout/Navbar'
import { Footer } from '../components/Layout/Footer'
import { SEO } from '../components/seo'
import { ErrorState } from '../components/common/ErrorState'
import { SkeletonCard } from '../components/common/Skeleton'
import { useTeam } from '../hooks/useTeam'
import { MemberGrid } from '../components/teams/MemberGrid'

const DEFAULT_LOGO = 'https://placehold.co/120x120/041E42/FFFFFF?text=Team'

function TeamPage() {
  const { id } = useParams<{ id: string }>()
  const [isDescExpanded, setIsDescExpanded] = useState(false)
  const teamId = id ? parseInt(id, 10) : NaN

  if (Number.isNaN(teamId) || teamId <= 0) {
    return <Navigate to="/404" replace />
  }

  const { team, isLoading, error, refetch } = useTeam(teamId)

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <SEO title={team?.name ? `${team.name} - 球队详情` : '球队详情'} description="Joyful Baseball League 球队信息" />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <SkeletonCard rows={4} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : team ? (
          <>
            <section className="rounded-2xl bg-gradient-to-br from-[#041E42] to-[#0A2A5A] p-6 md:p-10 text-white shadow-lg">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <img
                  src={team.logo_url || DEFAULT_LOGO}
                  alt={team.name}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover bg-white/10 border-4 border-white/20 transition-transform hover:scale-105"
                  loading="lazy"
                />
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl md:text-4xl font-bold">{team.name}</h1>
                  {team.division && (
                    <span className="inline-block mt-2 px-3 py-1 text-sm bg-white/10 rounded-full">
                      {team.division}
                    </span>
                  )}
                  <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-4 text-lg">
                    <div>
                      <span className="text-white/70">战绩</span>
                      <div className="font-semibold">
                        <span style={{ color: '#BF0D3E' }}>{team.record.wins}</span>
                        <span className="text-white/60 mx-1">胜</span>
                        <span style={{ color: '#BF0D3E' }}>{team.record.losses}</span>
                        <span className="text-white/60 mx-1">负</span>
                        <span className="text-white/80">({team.record.win_rate}%)</span>
                      </div>
                    </div>
                  </div>

                  {team.description && (
                    <div className="mt-4">
                      <p
                        className={`text-white/80 text-left ${
                          isDescExpanded ? '' : 'line-clamp-2'
                        }`}
                      >
                        {team.description}
                      </p>
                      <button
                        onClick={() => setIsDescExpanded((v) => !v)}
                        className="mt-1 flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
                        type="button"
                      >
                        {isDescExpanded ? (
                          <>
                            收起 <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            展开 <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <MemberGrid teamId={teamId} captainId={team.captain_id} />
          </>
        ) : (
          <ErrorState title="未找到球队" message="该球队不存在或已被删除" />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default TeamPage
