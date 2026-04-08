import { Sparkles } from 'lucide-react'

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Sparkles className="w-12 h-12 text-mlb-navy mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-mlb-navy mb-2">
            Tailwind MLB Theme Test
          </h1>
          <p className="text-gray-600">
            Welcome to Joyful Web - A modern React + Vite + TypeScript application
          </p>
        </div>

        <div className="space-y-8">
          {/* MLB Colors */}
          <section className="bg-white p-6 rounded-card shadow-card">
            <h2 className="text-xl font-semibold text-mlb-navy mb-4">MLB Brand Colors</h2>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-mlb-navy text-white p-4 rounded-card shadow-card">
                bg-mlb-navy (#041E42)
              </div>
              <div className="bg-mlb-red text-white p-4 rounded-card shadow-card">
                bg-mlb-red (#BF0D3E)
              </div>
              <div className="bg-mlb-red-dark text-white p-4 rounded-card shadow-card">
                bg-mlb-red-dark (#A00B34)
              </div>
              <div className="bg-gold text-white p-4 rounded-card shadow-card">
                bg-gold (#C4A35A)
              </div>
            </div>
          </section>

          {/* Status Colors */}
          <section className="bg-white p-6 rounded-card shadow-card">
            <h2 className="text-xl font-semibold text-mlb-navy mb-4">Status Colors</h2>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-success text-white p-4 rounded-button">
                bg-success
              </div>
              <div className="bg-warning text-white p-4 rounded-button">
                bg-warning
              </div>
              <div className="bg-info text-white p-4 rounded-button">
                bg-info
              </div>
              <div className="bg-error text-white p-4 rounded-button">
                bg-error
              </div>
            </div>
          </section>

          {/* Text Colors */}
          <section className="bg-white p-6 rounded-card shadow-card">
            <h2 className="text-xl font-semibold text-mlb-navy mb-4">Text Colors</h2>
            <div className="space-y-2">
              <p className="text-mlb-navy text-lg">text-mlb-navy</p>
              <p className="text-mlb-red text-lg">text-mlb-red</p>
              <p className="text-gold text-lg">text-gold</p>
            </div>
          </section>

          {/* Custom Shadows */}
          <section className="bg-white p-6 rounded-card shadow-card">
            <h2 className="text-xl font-semibold text-mlb-navy mb-4">Custom Shadows</h2>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-white p-6 rounded-card shadow-card border">
                shadow-card
              </div>
              <div className="bg-white p-6 rounded-card shadow-card-hover border">
                shadow-card-hover
              </div>
            </div>
          </section>

          {/* Border Radius */}
          <section className="bg-white p-6 rounded-card shadow-card">
            <h2 className="text-xl font-semibold text-mlb-navy mb-4">Border Radius</h2>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-mlb-navy text-white p-4 rounded-card">
                rounded-card (12px)
              </div>
              <div className="bg-mlb-red text-white p-4 rounded-button">
                rounded-button (8px)
              </div>
            </div>
          </section>

          {/* Navigation */}
          <div className="text-center">
            <a
              href="/admin"
              className="inline-block px-6 py-3 bg-mlb-navy text-white rounded-button font-medium hover:bg-opacity-90 transition-colors"
            >
              Go to Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
