import React, { useState, useEffect } from 'react'
import './App.css'
import Layout from './components/Layout'
import CatalogPage from './pages/CatalogPage'
import MyOrdersPage from './pages/MyOrdersPage'

type Page = 'catalog' | 'orders'

type PowerAppsWindow = Window & {
  Microsoft?: {
    PowerApps?: {
      Pages?: {
        readUserInfo?: () => { displayName?: string; userId?: string }
      }
    }
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('catalog')
  const [userDisplayName, setUserDisplayName] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const tryGetUser = () => {
      const win = window as PowerAppsWindow
      const userInfo = win.Microsoft?.PowerApps?.Pages?.readUserInfo?.()
      if (userInfo?.displayName) {
        setUserDisplayName(userInfo.displayName)
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
        if (tryGetUser() || attempts >= 20) {
          clearInterval(interval)
        }
      }, 500)

      return () => clearInterval(interval)
    }
  }, [])

  return (
    <Layout
      userDisplayName={userDisplayName || 'Deepika Singh'}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      error={error}
      onClearError={() => setError(null)}
    >
      {currentPage === 'catalog' && (
        <CatalogPage onError={setError} />
      )}
      {currentPage === 'orders' && (
        <MyOrdersPage onError={setError} />
      )}
    </Layout>
  )
}