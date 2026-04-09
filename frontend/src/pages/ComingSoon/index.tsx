import { Link } from 'react-router-dom'
import Navbar from '../../components/Layout/Navbar'
import Footer from '../../components/Layout/Footer'

function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-mlb-navy mb-4">
            即将上线
          </h1>
          <p className="text-xl text-gray-600 mb-2">Coming Soon</p>
          <p className="text-gray-500 mb-8">此功能正在开发中，敬请期待</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-mlb-red text-white rounded-lg hover:bg-mlb-red/90 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ComingSoon
