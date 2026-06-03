import { useState, useEffect } from 'react'
import './App.css'
import Layout from './components/Layout'
import CatalogPage from './pages/CatalogPage'
import MyOrdersPage from './pages/MyOrdersPage'
import AllOrdersPage from './pages/AllOrdersPage'
import ReportsPage from './pages/ReportsPage'
import AccessDeniedPage from './pages/AccessDeniedPage'
import type { UserRole } from './utils/roleUtils'
import { getUserRole } from './utils/roleUtils'

type Page = 'catalog' | 'orders' | 'all-orders' | 'reports'

type PowerAppsWindow = Window & {
  Microsoft?: {
    PowerApps?: {
      Pages?: {
        readUserInfo?: () => { displayName?: string; fullName?: string; userId?: string }
      }
    }
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('catalog')
  const [userDisplayName, setUserDisplayName] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingRole, setLoadingRole] = useState(true)

  useEffect(() => {
    const tryGetUser = () => {
      const win = window as PowerAppsWindow
      const userInfo = win.Microsoft?.PowerApps?.Pages?.readUserInfo?.()
      console.log('🔍 tryGetUser - PowerApps available:', !!win.Microsoft?.PowerApps?.Pages?.readUserInfo)
      console.log('🔍 tryGetUser - userInfo:', userInfo)
      const name = userInfo?.displayName || userInfo?.fullName
      if (name && userInfo?.userId) {
        console.log('✅ Got user:', { name, userId: userInfo.userId })
        setUserDisplayName(name)
        setUserId(userInfo.userId)
        return true
      }
      return false
    }

    // Try immediately
    if (!tryGetUser()) {
      // Retry every 500ms for up to 10 seconds
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        console.log(`🔄 Retry attempt ${attempts}/20 for user info`)
        if (tryGetUser() || attempts >= 20) {
          clearInterval(interval)
        }
      }, 500)

      return () => clearInterval(interval)
    }
  }, [])

  // Fetch user role
  useEffect(() => {
  const fetchRole = async () => {
    try {
      const role = await getUserRole()
      setUserRole(role)
    } catch (err) {
      console.error('Failed to fetch user role:', err)
      setUserRole('Order User') // fallback to Order User
    } finally {
      setLoadingRole(false)
    }
  }

  // Wait max 3 seconds for userId, then fetch role anyway
  const timer = setTimeout(() => {
    fetchRole()
  }, 3000)

  if (userId) {
    clearTimeout(timer)
    fetchRole()
  }

  return () => clearTimeout(timer)
}, [userId])

  // Handle navigation based on role
  const handleNavigate = (page: Page) => {
    if (page === 'all-orders' && userRole !== 'Order Admin') {
      setError('You do not have permission to view all orders')
      return
    }
    if (page === 'reports' && userRole !== 'Order Admin') {
      setError('You do not have permission to view reports')
      return
    }
    setCurrentPage(page)
    setError(null)
  }

  if (loadingRole) {
    return <div className="loading-screen">Loading permissions...</div>
  }

  // Show app for any valid role, AccessDenied only if role is null
  if (userRole === null) {
    return <AccessDeniedPage />
  }

  return (
    <Layout
      userDisplayName={userDisplayName}
      currentPage={currentPage}
      onNavigate={handleNavigate}
      userRole={userRole}
      error={error}
      onClearError={() => setError(null)}
    >
      {currentPage === 'catalog' && (
        <CatalogPage onError={setError} />
      )}
      {currentPage === 'orders' && (
        <MyOrdersPage onError={setError} userId={userId} />
      )}
      {currentPage === 'all-orders' && userRole === 'Order Admin' && (
        <AllOrdersPage onError={setError} />
      )}
      {currentPage === 'reports' && userRole === 'Order Admin' && (
        <ReportsPage onError={setError} />
      )}
    </Layout>
  )
}