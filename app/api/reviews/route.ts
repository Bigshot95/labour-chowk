import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { reviewSchema } from '@/lib/validations'

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
    const validatedData = reviewSchema.parse(body)

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { 
        id: validatedData.bookingId,
        customerId: user.id,
        status: 'COMPLETED'
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or not completed' },
        { status: 404 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        ...validatedData,
        userId: user.id,
      }
    })

    // Update worker rating
    const workerReviews = await prisma.review.findMany({
      where: {
        booking: {
          workerId: booking.workerId
        }
      }
    })

    const avgRating = workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length

    await prisma.workerProfile.update({
      where: { userId: booking.workerId },
      data: { rating: avgRating }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Review creation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}