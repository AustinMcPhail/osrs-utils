import { getItems } from '@/lib/items'
import { getTimestamps } from '@/lib/timestamps'
import { writeFile } from 'fs/promises'
import { NextResponse } from 'next/server'

async function GET(req: Request) {
    const { items } = await getItems()
    const { timestamps, cached: timestampsCached } = await getTimestamps(items)
    if (!timestampsCached) {
        await writeFile('/cache/timestamps.json', JSON.stringify(timestamps))
    }
    return NextResponse.json({
        data: timestamps,
    })
}

export { GET }
