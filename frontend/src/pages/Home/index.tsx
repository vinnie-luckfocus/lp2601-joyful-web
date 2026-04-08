import { Sparkles } from 'lucide-react'

function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <Sparkles size={48} style={{ marginBottom: '1rem', color: '#646cff' }} />
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
        Welcome to Joyful Web
      </h1>
      <p style={{ fontSize: '1.125rem', color: '#666', maxWidth: '600px' }}>
        A modern React + Vite + TypeScript application with Express backend.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <a
          href="/admin"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#646cff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 500
          }}
        >
          Go to Admin
        </a>
      </div>
    </div>
  )
}

export default Home
