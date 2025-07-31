import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface JWTPayload {
  userId: string
  phone: string
  role: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

export async function getUserFromRequest(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { workerProfile: true }
    })

    return user
  } catch {
    return null
  }
}

// Mock OTP generation and verification
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function verifyOTP(inputOTP: string, storedOTP: string): boolean {
  // In production, this would verify against SMS service
  return inputOTP === storedOTP || inputOTP === '123456' // Mock OTP for testing
}