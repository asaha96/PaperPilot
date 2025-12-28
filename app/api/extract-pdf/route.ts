import { NextRequest, NextResponse } from 'next/server'

// Dynamic import for pdf-parse (server-side only)
let pdfParse: any = null
async function getPdfParse() {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse')).default
  }
  return pdfParse
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Import pdf-parse dynamically
    const pdfParseFn = await getPdfParse()

    // Extract text from PDF
    const pdfData = await pdfParseFn(buffer)
    const text = pdfData.text
    const numPages = pdfData.numpages

    // Extract title (usually first line or from metadata)
    const title = pdfData.info?.Title || 
                  text.split('\n').find((line: string) => line.trim().length > 10 && line.trim().length < 200) || 
                  file.name.replace('.pdf', '')

    // Extract abstract/summary (look for common patterns)
    const abstractMatch = text.match(/(?:abstract|summary)[:\s]*([\s\S]{200,2000})/i)
    const summary = abstractMatch 
      ? abstractMatch[1].trim().substring(0, 2000)
      : text.substring(0, 2000) // Fallback to first 2000 chars

    return NextResponse.json({
      title: title.trim(),
      summary: summary.trim(),
      fullText: text,
      numPages,
      metadata: pdfData.info,
    })
  } catch (error) {
    console.error('Error extracting PDF:', error)
    return NextResponse.json(
      { error: 'Failed to extract PDF content' },
      { status: 500 }
    )
  }
}

