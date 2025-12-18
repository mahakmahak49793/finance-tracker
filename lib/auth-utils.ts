// lib/auth-utils.ts
import { NextRequest } from 'next/server'
import { verifyToken } from './auth'

export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return null
    }

    // Verify token and get user ID
    const decoded = verifyToken(token)
    if (!decoded) {
      return null
    }

    return decoded.userId
  } catch (error) {
    console.error('Error getting user ID from request:', error)
    return null
  }
}