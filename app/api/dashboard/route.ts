// app/api/dashboard/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get total balance
    const accounts = await prisma.account.findMany()
    const totalBalance = accounts.reduce(
      (sum: number, account: { balance: number | null }) =>
        sum + (account.balance ?? 0),
      0
    )
    
    // Get transactions for the current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      include: {
        account: true,
        category: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 10
    })
    
    // Calculate total income and expense
    let totalIncome = 0
    let totalExpense = 0
    
    // Explicitly type the transaction parameter
    transactions.forEach((transaction: { type: string; amount: number }) => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount
      } else {
        totalExpense += transaction.amount
      }
    })
    
    return NextResponse.json({
      totalBalance,
      totalIncome,
      totalExpense,
      recentTransactions: transactions
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}