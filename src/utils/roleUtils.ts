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

    if (userInfo?.roles) {
      const roles = userInfo.roles.map(r => r.toLowerCase())
      if (roles.some(r => r.includes('admin'))) return 'Order Admin'
      if (roles.some(r => r.includes('user'))) return 'Order User'
    }

    // If user is logged in, grant admin access by default (Power Apps already handles auth)
    if (userInfo?.userId) {
      console.log('User logged in:', userInfo.userId, 'defaulting to Order Admin')
      return 'Order Admin'
    }
  } catch (error) {
    console.error('Error fetching user role:', error)
  }

  return 'Order User'
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