import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, verifyPassword, hashPassword } from '@/lib/auth'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
  try {
    
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, currentPassword, newPassword } = body

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let updateData: any = {}

    // If changing password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        )
      }

      // Verify current password
      const isValid = await verifyPassword(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Hash new password
      updateData.password = await hashPassword(newPassword)
    }

    // Update profile info if provided
    if (name !== undefined) updateData.name = name
    if (email !== undefined) {
      // Check if email is already taken by another user
      if (email !== user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email }
        })
        if (existingUser) {
          return NextResponse.json(
            { error: 'Email is already in use' },
            { status: 400 }
          )
        }
        updateData.email = email
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    })
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}