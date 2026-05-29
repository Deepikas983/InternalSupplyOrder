import '../styles/Layout.css'
import type { UserRole } from '../utils/roleUtils'

interface LayoutProps {
  userDisplayName: string
  currentPage: 'catalog' | 'orders' | 'all-orders' | 'reports'
  onNavigate: (page: 'catalog' | 'orders' | 'all-orders' | 'reports') => void
  userRole: UserRole
  error: string | null
  onClearError: () => void
  children: React.ReactNode
}

export default function Layout({
  userDisplayName,
  currentPage,
  onNavigate,
  userRole,
  error,
  onClearError,
  children
}: LayoutProps) {
  const isAdmin = userRole === 'Order Admin'

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Supply Hub</h1>
        <div className="user-info">
          <span className="user-name">{userDisplayName}</span>
          {isAdmin && <span className="user-role-badge">Admin</span>}
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

            {isAdmin && (
              <>
                <div className="nav-section">
                  <h3 className="nav-section-title">Administration</h3>
                  <button
                    className={`nav-item ${currentPage === 'all-orders' ? 'active' : ''}`}
                    onClick={() => onNavigate('all-orders')}
                  >
                    All Orders
                  </button>
                </div>

                <div className="nav-section">
                  <h3 className="nav-section-title">Reports</h3>
                  <button
                    className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`}
                    onClick={() => onNavigate('reports')}
                  >
                    Analytics
                  </button>
                </div>
              </>
            )}
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
