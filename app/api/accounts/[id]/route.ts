// app/api/accounts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth-utils'

// In Next.js App Router, params is a Promise
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise
    const { id } = await params
    
    console.log('Account ID from params:', id)
    
    if (!id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    console.log('Update request data:', {
      accountId: id,
      userId,
      data
    })
    
    // First, check if the account belongs to the user
    const existingAccount = await prisma.account.findFirst({
      where: {
        id: id,
        userId: userId
      }
    })
    
    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Account not found or unauthorized' },
        { status: 404 }
      )
    }
    
    // Convert balance to float if needed
    const updateData = {
      name: data.name,
      type: data.type,
      balance: data.balance !== undefined ? parseFloat(data.balance) : existingAccount.balance,
    }
    
    console.log('Update data prepared:', updateData)
    
    const account = await prisma.account.update({
      where: { id: id },
      data: updateData
    })
    
    console.log('Account updated successfully:', account)
    
    return NextResponse.json(account)
  } catch (error: any) {
    console.error('Error updating account:', error)
    console.error('Full error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update account',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise
    const { id } = await params
    
    console.log('Delete request for account ID:', id)
    
    if (!id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // First, check if the account belongs to the user
    const existingAccount = await prisma.account.findFirst({
      where: {
        id: id,
        userId: userId
      }
    })
    
    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Account not found or unauthorized' },
        { status: 404 }
      )
    }
    
    // Check if account has transactions
    const transactionCount = await prisma.transaction.count({
      where: { accountId: id }
    })
    
    console.log('Transaction count for account:', transactionCount)
    
    if (transactionCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete account with existing transactions' },
        { status: 400 }
      )
    }
    
    await prisma.account.delete({
      where: { id: id }
    })
    
    console.log('Account deleted successfully')
    
    return NextResponse.json({ 
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting account:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to delete account',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// Also add GET method to retrieve single account
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const account = await prisma.account.findFirst({
      where: {
        id: id,
        userId: userId
      },
      include: {
        transactions: {
          orderBy: {
            date: 'desc'
          },
          take: 10
        }
      }
    })
    
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(account)
  } catch (error: any) {
    console.error('Error fetching account:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    )
  }
}