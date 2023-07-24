import { getItems } from '@/lib/items'
import { writeFile } from 'fs/promises'
import { NextResponse } from 'next/server'

async function GET(req: Request) {
    const { items, cached: itemsCached } = await getItems()
    console.log('GET', { items, itemsCached })
    if (!itemsCached) {
        console.log('Writing items.json')
        await writeFile('/cache/items.json', JSON.stringify(items))
    }
    return NextResponse.json({
        data: items,
    })
}

export { GET }

// https://oldschool.runescape.wiki/api.php?action=query&list=categorymembers&cmtitle=Category:Items&cmlimit=500&format=json\
// action: 'query',
// list: 'categorymembers',
// cmtitle: 'Category:Items',
// cmlimit: `500`,
// format: 'json',
// cmcontinue: '',
// }
