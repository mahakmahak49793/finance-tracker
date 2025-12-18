// app/api/accounts/route.ts
/*eslint-disable @typescript-eslint/no-require-imports*/
/*eslint-disable  @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth-utils'

// GET - Fetch all accounts for the user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(accounts)
  } catch (error: any) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new account
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const data = await request.json()
    console.log('Received data:', data)
    
    // Validate required fields
    if (!data.name || !data.type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    const accountData = {
      name: data.name,
      type: data.type,
      balance: parseFloat(data.balance) || 0,
      userId: userId
    }

    console.log('Creating account with data:', accountData)
    
    const account = await prisma.account.create({
      data: accountData
    })
    
    console.log('Account created:', account)
    
    return NextResponse.json(account, { status: 201 })
  } catch (error: any) {
    console.error('Error creating account:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to create account',
        details: error.message 
      },
      { status: 500 }
    )
  }
}