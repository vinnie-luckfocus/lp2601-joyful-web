import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA] px-4 text-center">
      <h1 className="text-6xl font-bold text-[#041E42] mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">页面未找到</p>
      <Link
        to="/"
        className="px-6 py-3 bg-[#BF0D3E] text-white rounded-lg hover:bg-[#A00B34] transition-colors"
      >
        返回首页
      </Link>
    </div>
  )
}

export default NotFoundPage
