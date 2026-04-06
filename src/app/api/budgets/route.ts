import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  let query = supabase
    .from('budgets')
    .select(`*, budget_categories(*, category:categories(*))`)
    .eq('user_id', user.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (year && month) {
    query = query.eq('year', Number(year)).eq('month', Number(month))
    const { data, error } = await query.maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { year, month, total_amount, notes, allocations } = body

  if (!year || !month || total_amount == null) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .insert({ user_id: user.id, year, month, total_amount, notes: notes || null })
    .select()
    .single()

  if (budgetError) return NextResponse.json({ error: budgetError.message }, { status: 500 })

  if (allocations?.length) {
    const rows = allocations.map((a: { category_id: string; allocated: number }) => ({
      budget_id: budget.id,
      category_id: a.category_id,
      allocated: a.allocated,
    }))
    const { error: allocError } = await supabase.from('budget_categories').insert(rows)
    if (allocError) return NextResponse.json({ error: allocError.message }, { status: 500 })
  }

  return NextResponse.json(budget, { status: 201 })
}
