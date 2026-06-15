import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppProvider }  from './context/AppContext.jsx'
import AppRouter from './routes/AppRouter.jsx'
import './index.css'

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRouter />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#FFFFFF',
              color: '#2D3436',
              borderRadius: '14px',
              boxShadow: '0 4px 24px rgba(26,107,107,0.12)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#1A6B6B', secondary: '#FFFFFF' } },
            error:   { iconTheme: { primary: '#FF4757', secondary: '#FFFFFF' } },
          }}
        />
      </AppProvider>
    </AuthProvider>
  )
}
