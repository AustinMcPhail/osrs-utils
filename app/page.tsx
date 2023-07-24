import { getInfoboxes } from '@/lib/infoboxes'
import { getItems } from '@/lib/items'
import { getTimestamps } from '@/lib/timestamps'
import { writeFile } from 'fs/promises'
import Uploader from './Uploader'

export default async function Home() {
    const { items, cached: itemsCached } = await getItems()
    if (!itemsCached) {
        console.log('Writing items.json')
        await writeFile('cache/items.json', JSON.stringify(items))
    }
    const { timestamps, cached: timestampsCached } = await getTimestamps(items)
    if (!timestampsCached) {
        console.log('Writing timestamps.json')
        await writeFile('cache/timestamps.json', JSON.stringify(timestamps))
    }
    const { infoboxes, cached: infoBoxesCached } = await getInfoboxes(items)
    if (!infoBoxesCached) {
        console.log('Writing infoBoxes.json')
        await writeFile('cache/infoBoxes.json', JSON.stringify(infoboxes))
    }

    return (
        <main>
            <h1>OpenCV.js</h1>
            <p>
                {'Items: '}
                {Object.keys(items).length}
            </p>
            <p>
                {'Timestamps: '}
                {Object.keys(timestamps).length}
            </p>
            <Uploader />
        </main>
    )
}
