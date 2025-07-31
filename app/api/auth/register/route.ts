import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { userRegistrationSchema } from '@/lib/validations'
import { generateOTP } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = userRegistrationSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: validatedData.phone }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this phone number already exists' },
        { status: 400 }
      )
    }

    // Create user
    const user = await prisma.user.create({
      data: validatedData
    })

    // Generate OTP (in production, send via SMS)
    const otp = generateOTP()
    
    // Store OTP temporarily (in production, use Redis or similar)
    // For demo purposes, we'll return it in response
    console.log(`OTP for ${validatedData.phone}: ${otp}`)

    return NextResponse.json({
      message: 'User registered successfully. OTP sent to phone.',
      userId: user.id,
      otp: otp // Remove this in production
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}