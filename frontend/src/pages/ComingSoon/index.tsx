import { Link } from 'react-router-dom'
import { Navbar } from '../../components/Layout/Navbar'
import { Footer } from '../../components/Layout/Footer'
import { Button } from '../../components/common/Button'
import { Construction } from 'lucide-react'

function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 py-12" data-testid="coming-soon-page">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-mlb-navy/10 rounded-full">
              <Construction className="w-16 h-16 text-mlb-navy" data-testid="construction-icon" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="coming-soon-title">
            即将上线
          </h1>
          <p className="text-gray-600 mb-2" data-testid="coming-soon-text">
            Coming Soon
          </p>
          <p className="text-gray-500 mb-8" data-testid="coming-soon-description">
            该功能正在开发中，敬请期待
          </p>

          <Link to="/" data-testid="back-to-home">
            <Button variant="primary" size="lg">
              返回首页
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ComingSoon
