import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Replaces all allocations for a budget
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { allocations } = body

  // Verify budget belongs to user
  const { data: budget } = await supabase
    .from('budgets')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!budget) return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })

  // Delete existing
  await supabase.from('budget_categories').delete().eq('budget_id', id)

  // Insert new
  if (allocations?.length) {
    const rows = allocations.map((a: { category_id: string; allocated: number }) => ({
      budget_id: id,
      category_id: a.category_id,
      allocated: a.allocated,
    }))
    const { error } = await supabase.from('budget_categories').insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
