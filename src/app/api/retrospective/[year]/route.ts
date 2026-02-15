import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getRetrospectiveData } from '@/lib/services/retrospective'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { year: yearStr } = await params
  const year = parseInt(yearStr)

  if (isNaN(year) || year < 2000 || year > new Date().getFullYear()) {
    return NextResponse.json({ error: 'Ano inválido' }, { status: 400 })
  }

  const data = await getRetrospectiveData(session.user.id, year)

  if (!data) {
    return NextResponse.json(null)
  }

  return NextResponse.json(data)
}
