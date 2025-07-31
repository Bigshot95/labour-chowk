import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { messageSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = messageSchema.parse(body)

    const message = await prisma.message.create({
      data: {
        ...validatedData,
        senderId: user.id,
      },
      include: {
        sender: {
          select: { id: true, name: true }
        },
        receiver: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Message creation error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}