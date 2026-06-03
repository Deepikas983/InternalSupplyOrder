export type UserRole = 'Order Admin' | 'Order User' | null

type PowerAppsWindow = Window & {
  Microsoft?: {
    PowerApps?: {
      Pages?: {
        readUserInfo?: () => { userId?: string; fullName?: string; roles?: string[] }
      }
    }
  }
}

export const ROLE_PERMISSIONS = {
  'Order Admin': ['catalog', 'myOrders', 'allOrders', 'reports'],
  'Order User': ['catalog', 'myOrders'],
}

export async function getUserRole(): Promise<UserRole> {
  try {
    const win = window as PowerAppsWindow
    const userInfo = win.Microsoft?.PowerApps?.Pages?.readUserInfo?.()

    console.log('🔍 getUserRole - Full userInfo:', userInfo)
    console.log('🔍 getUserRole - User roles:', userInfo?.roles)
    console.log('🔍 getUserRole - User ID:', userInfo?.userId)

    if (userInfo?.roles) {
      const roles = userInfo.roles.map(r => r.toLowerCase())
      console.log('🔍 Lowercased roles:', roles)
      if (roles.some(r => r.includes('admin'))) {
        console.log('✅ Detected admin role')
        return 'Order Admin'
      }
      if (roles.some(r => r.includes('user'))) {
        console.log('✅ Detected user role')
        return 'Order User'
      }
    }

    // If user is logged in, grant admin access by default (Power Apps already handles auth)
    if (userInfo?.userId) {
      console.log('✅ User logged in, defaulting to Order Admin:', userInfo.userId)
      return 'Order Admin'
    }

    console.log('⚠️ No userInfo or userId found - granting Order Admin for testing')
    // TODO: Remove this when Power Apps integration is complete
    return 'Order Admin'
  } catch (error) {
    console.error('❌ Error fetching user role:', error)
  }

  console.log('⚠️ Defaulting to Order Admin for testing')
  return 'Order Admin'
}

export function isAdmin(role: UserRole): boolean {
  return role === 'Order Admin'
}

export function isUser(role: UserRole): boolean {
  return role === 'Order User'
}

export function hasAccess(role: UserRole): boolean {
  return role !== null
}

export function canAccess(role: UserRole, page: string): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(page) ?? false
}