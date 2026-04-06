import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, category:categories(*)')
    .eq('user_id', user.id)
    .order('next_billing_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, amount, billing_cycle, next_billing_date, status, category_id, notes } = body

  if (!name?.trim() || amount == null || !billing_cycle || !next_billing_date) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      name: name.trim(),
      amount: Number(amount),
      billing_cycle,
      next_billing_date,
      status: status || 'active',
      category_id: category_id || null,
      notes: notes || null,
    })
    .select('*, category:categories(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
