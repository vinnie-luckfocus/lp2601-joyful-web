import { Shield, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

function Admin() {
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
      <Shield size={48} style={{ marginBottom: '1rem', color: '#22c55e' }} />
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
        Admin Dashboard
      </h1>
      <p style={{ fontSize: '1.125rem', color: '#666', maxWidth: '600px' }}>
        Admin area placeholder. This section will contain protected routes for administrative functions.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6b7280',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 500
          }}
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default Admin
