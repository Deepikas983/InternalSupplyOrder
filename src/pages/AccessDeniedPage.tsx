import '../styles/AccessDenied.css'

export default function AccessDeniedPage() {
  return (
    <div className="access-denied-container">
      <div className="access-denied-content">
        <div className="access-denied-icon">🔒</div>
        <h1>Access Denied</h1>
        <p>
          You do not have permission to access this application.
        </p>
        <p className="access-denied-help">
          Please contact your administrator.
        </p>
      </div>
    </div>
  )
}
