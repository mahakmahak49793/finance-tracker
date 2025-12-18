// app/api/transactions/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/*eslint-disable  @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth-utils'

// GET all transactions for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get query parameters for filtering
    const url = new URL(request.url)
    const accountId = url.searchParams.get('accountId')
    const categoryId = url.searchParams.get('categoryId')
    const type = url.searchParams.get('type')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const page = parseInt(url.searchParams.get('page') || '1')

    // Build filter conditions
    const whereConditions: any = {
      userId: userId
    }

    if (accountId) {
      whereConditions.accountId = accountId
    }

    if (categoryId) {
      whereConditions.categoryId = categoryId
    }

    if (type && ['income', 'expense'].includes(type)) {
      whereConditions.type = type
    }

    if (startDate || endDate) {
      whereConditions.date = {}
      if (startDate) {
        whereConditions.date.gte = new Date(startDate)
      }
      if (endDate) {
        whereConditions.date.lte = new Date(endDate)
      }
    }

    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await prisma.transaction.count({
      where: whereConditions
    })

    const transactions = await prisma.transaction.findMany({
      where: whereConditions,
      include: {
        account: {
          select: {
            id: true,
            name: true,
            
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      skip: skip,
      take: limit
    })
    
    return NextResponse.json({
      transactions,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST create new transaction
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
    
    // Validate required fields
    if (!data.amount || data.amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    if (!data.type || !['income', 'expense'].includes(data.type)) {
      return NextResponse.json(
        { error: 'Valid type is required (income or expense)' },
        { status: 400 }
      )
    }

    if (!data.accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    if (!data.categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    if (!data.date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: data.accountId,
        userId: userId
      }
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or unauthorized' },
        { status: 404 }
      )
    }

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        userId: userId
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found or unauthorized' },
        { status: 404 }
      )
    }

    // Validate category type matches transaction type
    if (category.type !== data.type) {
      return NextResponse.json(
        { error: `Category type (${category.type}) does not match transaction type (${data.type})` },
        { status: 400 }
      )
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma: any) => {
      // Create the transaction
      const transaction = await prisma.transaction.create({
        data: {
          amount: parseFloat(data.amount),
          type: data.type,
          note: data.note?.trim(),
          date: new Date(data.date),
          userId: userId,
          accountId: data.accountId,
          categoryId: data.categoryId
        },
        include: {
          account: true,
          category: true
        }
      })

      // Update account balance
      const balanceChange = data.type === 'income' ? data.amount : -data.amount
      
      await prisma.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: parseFloat(balanceChange)
          }
        }
      })

      return transaction
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error creating transaction:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid account or category' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create transaction',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}