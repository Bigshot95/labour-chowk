import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { bookingSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = bookingSchema.parse(body)

    const booking = await prisma.booking.create({
      data: {
        ...validatedData,
        customerId: user.id,
      },
      include: {
        worker: {
          include: { workerProfile: true }
        },
        customer: true
      }
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = user.role === 'CUSTOMER' 
      ? { customerId: user.id }
      : { workerId: user.id }

    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            phone: true,
            workerProfile: {
              select: {
                profilePic: true,
                skills: true,
                rating: true
              }
            }
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        review: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Bookings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}