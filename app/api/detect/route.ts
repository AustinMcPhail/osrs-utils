import { getItems } from '@/lib/items'
import { NextResponse } from 'next/server'

async function POST(req: Request) {
    const data = await req.formData()
    const file = data.get('file')
    const items = await getItems()
    return NextResponse.json({
        data: items,
    })
}

export { POST }
