// components/dashboard/SummaryCards.tsx
import { FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

interface SummaryCardsProps {
  totalBalance: number
  totalIncome: number
  totalExpense: number
}

export default function SummaryCards({ totalBalance, totalIncome, totalExpense }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total Balance',
      amount: totalBalance,
      icon: FiDollarSign,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Income',
      amount: totalIncome,
      icon: FiTrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Expense',
      amount: totalExpense,
      icon: FiTrendingDown,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className={`${card.bgColor} rounded-xl border border-gray-200 p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className={`text-3xl font-bold ${card.textColor} mt-2`}>
                  ${card.amount.toFixed(2)}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-full`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}