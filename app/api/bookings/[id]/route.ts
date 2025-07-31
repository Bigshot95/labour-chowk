import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: params.id }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check authorization
    const canUpdate = (user.role === 'WORKER' && booking.workerId === user.id) ||
                     (user.role === 'CUSTOMER' && booking.customerId === user.id) ||
                     (user.role === 'ADMIN')

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Not authorized to update this booking' },
        { status: 403 }
      )
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
      include: {
        worker: {
          include: { workerProfile: true }
        },
        customer: true
      }
    })

    // Update worker's total jobs count if completed
    if (status === 'COMPLETED') {
      await prisma.workerProfile.update({
        where: { userId: booking.workerId },
        data: {
          totalJobs: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Booking update error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}