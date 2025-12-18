// app/api/transactions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth-utils'

// GET single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
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

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: userId
      },
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
      }
    })
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

// PUT update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
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
    
    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: userId
      },
      include: {
        account: true
      }
    })
    
    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found or unauthorized' },
        { status: 404 }
      )
    }

    // Validate type if provided
    if (data.type && !['income', 'expense'].includes(data.type)) {
      return NextResponse.json(
        { error: 'Type must be either "income" or "expense"' },
        { status: 400 }
      )
    }

    // If changing account, verify new account belongs to user
    if (data.accountId && data.accountId !== existingTransaction.accountId) {
      const newAccount = await prisma.account.findFirst({
        where: {
          id: data.accountId,
          userId: userId
        }
      })

      if (!newAccount) {
        return NextResponse.json(
          { error: 'New account not found or unauthorized' },
          { status: 404 }
        )
      }
    }

    // If changing category, verify new category belongs to user and matches type
    if (data.categoryId && data.categoryId !== existingTransaction.categoryId) {
      const newCategory = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          userId: userId
        }
      })

      if (!newCategory) {
        return NextResponse.json(
          { error: 'New category not found or unauthorized' },
          { status: 404 }
        )
      }

      // Validate category type matches transaction type
      const transactionType = data.type || existingTransaction.type
      if (newCategory.type !== transactionType) {
        return NextResponse.json(
          { error: `Category type (${newCategory.type}) does not match transaction type (${transactionType})` },
          { status: 400 }
        )
      }
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // Calculate balance adjustment
      const oldAmount = existingTransaction.amount
      const oldType = existingTransaction.type
      const oldAccountId = existingTransaction.accountId
      
      const newAmount = data.amount !== undefined ? parseFloat(data.amount) : oldAmount
      const newType = data.type || oldType
      const newAccountId = data.accountId || oldAccountId

      // Update account balances
      if (oldAmount !== newAmount || oldType !== newType || oldAccountId !== newAccountId) {
        // Revert old transaction from old account
        const oldBalanceChange = oldType === 'income' ? -oldAmount : oldAmount
        await prisma.account.update({
          where: { id: oldAccountId },
          data: {
            balance: {
              increment: oldBalanceChange
            }
          }
        })

        // Apply new transaction to new account
        const newBalanceChange = newType === 'income' ? newAmount : -newAmount
        await prisma.account.update({
          where: { id: newAccountId },
          data: {
            balance: {
              increment: newBalanceChange
            }
          }
        })
      }

      // Update the transaction
      const updateData = {
        amount: newAmount,
        type: newType,
        note: data.note !== undefined ? data.note?.trim() : undefined,
        date: data.date ? new Date(data.date) : undefined,
        accountId: newAccountId,
        categoryId: data.categoryId
      }

      // Remove undefined values
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      )

      const transaction = await prisma.transaction.update({
        where: { id: id },
        data: filteredData,
        include: {
          account: true,
          category: true
        }
      })

      return transaction
    })
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error updating transaction:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update transaction',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
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

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: userId
      },
      include: {
        account: true
      }
    })
    
    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found or unauthorized' },
        { status: 404 }
      )
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (prisma) => {
      // Revert transaction from account balance
      const balanceChange = existingTransaction.type === 'income' 
        ? -existingTransaction.amount 
        : existingTransaction.amount
      
      await prisma.account.update({
        where: { id: existingTransaction.accountId },
        data: {
          balance: {
            increment: balanceChange
          }
        }
      })

      // Delete the transaction
      await prisma.transaction.delete({
        where: { id: id }
      })
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Transaction deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting transaction:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to delete transaction',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}