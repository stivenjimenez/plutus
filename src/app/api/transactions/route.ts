import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')
  const month = searchParams.get('month')
  const type = searchParams.get('type')
  const categoryId = searchParams.get('category_id')

  let query = supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (year && month) {
    const paddedMonth = String(month).padStart(2, '0')
    const start = `${year}-${paddedMonth}-01`
    const lastDay = new Date(Number(year), Number(month), 0).getDate()
    const end = `${year}-${paddedMonth}-${lastDay}`
    query = query.gte('date', start).lte('date', end)
  }

  if (type && (type === 'expense' || type === 'income')) {
    query = query.eq('type', type)
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId)
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
  const { category_id, type, amount, description, date, notes } = body

  if (!type || amount == null || !description?.trim() || !date) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      category_id: category_id || null,
      type,
      amount: Number(amount),
      description: description.trim(),
      date,
      notes: notes || null,
    })
    .select('*, category:categories(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
