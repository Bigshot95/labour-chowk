import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const worker = await prisma.user.findUnique({
      where: { 
        id: params.id,
        role: 'WORKER'
      },
      include: {
        workerProfile: true,
        reviews: {
          include: { 
            user: { select: { name: true } },
            booking: { select: { jobDescription: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        workerBookings: {
          where: { status: 'COMPLETED' },
          select: { id: true }
        }
      }
    })

    if (!worker) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(worker)
  } catch (error) {
    console.error('Worker fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch worker' },
      { status: 500 }
    )
  }
}