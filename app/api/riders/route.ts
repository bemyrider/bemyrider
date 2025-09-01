import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
// import { adaptRiderForSearch } from '@/lib/adapters' // TODO: Update to Drizzle

export async function GET() {
  try {
    // TODO: Convert to Drizzle query
    // Temporary: return empty array
    return NextResponse.json([])

  } catch (error: any) {
    console.error('Error fetching riders:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
