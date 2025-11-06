import { useEffect, useState } from 'react'

function App() {
  const [apiStatus, setApiStatus] = useState('loading')

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL
    if (!baseUrl) {
      console.error('VITE_API_URL is not set. Create client/.env with VITE_API_URL=http://localhost:5000')
      setApiStatus('config-missing')
      return
    }
    fetch(baseUrl + '/health')
      .then((r) => r.json())
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('offline'))
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, Arial', padding: 24 }}>
      <h1>Legal Services eMarketplace</h1>
      <p>Status: {apiStatus}</p>
      {apiStatus === 'config-missing' && (
        <p style={{ color: '#b91c1c' }}>
          Missing VITE_API_URL. Set it in client/.env (e.g., VITE_API_URL=http://localhost:5000) and restart dev server.
        </p>
      )}
    </div>
  )
}

export default App


