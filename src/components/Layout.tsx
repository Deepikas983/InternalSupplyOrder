import React from 'react'
import '../styles/Layout.css'

interface LayoutProps {
  userDisplayName: string
  currentPage: 'catalog' | 'orders'
  onNavigate: (page: 'catalog' | 'orders') => void
  error: string | null
  onClearError: () => void
  children: React.ReactNode
}

export default function Layout({
  userDisplayName,
  currentPage,
  onNavigate,
  error,
  onClearError,
  children
}: LayoutProps) {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Supply Hub</h1>
        <div className="user-info">
          <span className="user-name">{userDisplayName}</span>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div className="nav-section">
              <h3 className="nav-section-title">Catalog</h3>
              <button
                className={`nav-item ${currentPage === 'catalog' ? 'active' : ''}`}
                onClick={() => onNavigate('catalog')}
              >
                Browse Items
              </button>
            </div>

            <div className="nav-section">
              <h3 className="nav-section-title">My Orders</h3>
              <button
                className={`nav-item ${currentPage === 'orders' ? 'active' : ''}`}
                onClick={() => onNavigate('orders')}
              >
                View Orders
              </button>
            </div>
          </nav>
        </aside>

        <main className="content">
          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button className="close-btn" onClick={onClearError}>×</button>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
