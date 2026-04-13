import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { DashboardData, CategorySpending } from '@/types'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const now = new Date()
  const year = Number(searchParams.get('year') ?? now.getFullYear())
  const month = Number(searchParams.get('month') ?? now.getMonth() + 1)

  const paddedMonth = String(month).padStart(2, '0')
  const start = `${year}-${paddedMonth}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${paddedMonth}-${lastDay}`

  // Run all queries in parallel
  const [budgetRes, transactionsRes, subscriptionsRes, debtsRes] = await Promise.all([
    supabase
      .from('budgets')
      .select('*, budget_categories(*, category:categories(*))')
      .eq('user_id', user.id)
      .eq('year', year)
      .eq('month', month)
      .maybeSingle(),

    supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end),

    supabase
      .from('subscriptions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('next_billing_date', new Date().toISOString().split('T')[0])
      .lte('next_billing_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('next_billing_date'),

    supabase
      .from('debts')
      .select('current_balance')
      .eq('user_id', user.id)
      .eq('is_paid_off', false),
  ])

  const budget = budgetRes.data
  const transactions = transactionsRes.data ?? []
  const upcomingSubscriptions = subscriptionsRes.data ?? []
  const debts = debtsRes.data ?? []

  // Compute spending per category
  const spendingByCategory: Record<string, number> = {}
  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.category_id) {
      spendingByCategory[tx.category_id] = (spendingByCategory[tx.category_id] ?? 0) + tx.amount
    }
  }

  const categorySpending: CategorySpending[] = (budget?.budget_categories ?? []).map((bc: {
    category_id: string
    allocated: number
    category: { name: string }
  }) => {
    const spent = spendingByCategory[bc.category_id] ?? 0
    return {
      category_id: bc.category_id,
      category_name: bc.category.name,
      allocated: bc.allocated,
      spent,
      remaining: bc.allocated - spent,
    }
  })

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  const debtTotalBalance = debts.reduce((s, d) => s + d.current_balance, 0)

  const response: DashboardData = {
    budget_total: budget?.total_amount ?? null,
    category_spending: categorySpending,
    total_expenses: totalExpenses,
    total_income: totalIncome,
    net_balance: (budget?.total_amount ?? totalIncome) - totalExpenses,
    upcoming_subscriptions: upcomingSubscriptions,
    debt_total_balance: debtTotalBalance,
    debt_count: debts.length,
  }

  return NextResponse.json(response)
}
