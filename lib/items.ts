import { CatagoryQuery, Items, Root } from '@/types'
import { readFile } from 'fs/promises'
import { constructWikiItemRequestUrl } from './wiki'

export async function getItems(): Promise<{
    items: Items
    cached: boolean
}> {
    try {
        const cachedItems = await readFile('cache/items.json', 'utf-8')
        if (cachedItems) {
            console.log('Found cached items, items.json')
            return {
                items: JSON.parse(cachedItems),
                cached: true,
            }
        }
    } catch (error) {
        console.log('No cached items found, items.json')
    }

    let url = constructWikiItemRequestUrl({ cmcontinue: '' })
    let response = await fetch(url)
    let data = (await response.json()) as Root<CatagoryQuery>
    let items = data.query.categorymembers.reduce((acc, item) => {
        return {
            ...acc,
            [item.title]: {
                pageId: item.pageid,
            },
        }
    }, {})
    let continueToken = data.continue?.cmcontinue || ''
    while (continueToken) {
        url = constructWikiItemRequestUrl({ cmcontinue: continueToken })
        response = await fetch(url)
        data = (await response.json()) as Root<CatagoryQuery>
        continueToken = data.continue?.cmcontinue || ''
        items = data.query.categorymembers.reduce((acc, item) => {
            return {
                ...acc,
                [item.title]: {
                    pageId: item.pageid,
                },
            }
        }, items)
    }
    return {
        items,
        cached: false,
    }
}
