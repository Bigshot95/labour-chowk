import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Process image with Sharp
    const processedImage = await sharp(buffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer()

    // Save file
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    const path = join(process.cwd(), 'public/uploads', filename)
    
    await writeFile(path, processedImage)

    return NextResponse.json({ 
      message: 'Upload successful',
      filename: `/uploads/${filename}`
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}