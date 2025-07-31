import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { phoneSchema } from '@/lib/validations'
import { generateOTP } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const phone = phoneSchema.parse(body.phone)

    // Find user
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { workerProfile: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please register first.' },
        { status: 404 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    
    // Store OTP temporarily (in production, use Redis)
    console.log(`OTP for ${phone}: ${otp}`)

    return NextResponse.json({
      message: 'OTP sent to your phone',
      userId: user.id,
      otp: otp // Remove this in production
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}