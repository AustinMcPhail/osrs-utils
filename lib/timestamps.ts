import { Items, RevisionTimestamps } from '@/types'
import { readFile } from 'fs/promises'
import { constructWikiRequestUrl } from './wiki'

export async function getTimestamps(items: Items): Promise<{
    timestamps: RevisionTimestamps
    cached: boolean
}> {
    try {
        const cachedTimestamps = await readFile(
            'cache/timestamps.json',
            'utf-8'
        )
        if (cachedTimestamps) {
            console.log('Found cached timestamps, timestamps.json')
            return {
                timestamps: JSON.parse(cachedTimestamps),
                cached: true,
            }
        }
    } catch (error) {
        console.log('No cached timestamps found, timestamps.json')
    }

    const CHUNK_SIZE = 50
    const MILLISECONDS_BETWEEN_REQUESTS = 500
    let chunks: { key: string; pageId: number }[][] = []
    const entries = Object.entries(items)
    for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
        const chunk = entries.slice(i, i + CHUNK_SIZE).map(([key, value]) => ({
            key,
            pageId: value.pageId,
        }))
        chunks = [...chunks, chunk]
    }

    const fetchChunksWithDelay = async (
        chunks: { key: string; pageId: number }[][],
        iteration: number,
        timestamps: RevisionTimestamps
    ): Promise<RevisionTimestamps> => {
        if (chunks.length === 0) {
            return timestamps
        }

        let [first, ...rest] = chunks
        console.log(
            `Fetching chunk ${iteration}`,
            first.map((i) => i.pageId).join('|')
        )

        const url = constructWikiRequestUrl({
            action: 'query',
            prop: 'revisions',
            titles: first.map((item) => item.key).join('|'),
            format: 'json',
            rvprop: 'timestamp',
            cmcontinue: '',
            cmlimit: '',
            cmtitle: '',
        })
        const response = await fetch(url)
        const data = (await response.json()) as {
            query: {
                pages: {
                    [key: string]: {
                        revisions: { timestamp: string }[]
                    }
                }
            }
        }

        await new Promise((resolve) =>
            setTimeout(resolve, MILLISECONDS_BETWEEN_REQUESTS)
        )

        return await fetchChunksWithDelay(rest, iteration + 1, {
            ...timestamps,
            ...Object.entries(data.query.pages)
                .filter(([key, value]) => {
                    return value.revisions
                })
                .reduce((acc, [key, value]) => {
                    const item = first.find(
                        (item) => item.pageId === Number(key)
                    )
                    if (!item) {
                        throw new Error(
                            `Could not find item with pageId ${key}`
                        )
                    }
                    return {
                        ...acc,
                        [item.key]: value.revisions[0].timestamp,
                    }
                }, {}),
        })
    }

    const initialTimestamps = {}
    const timestamps = await fetchChunksWithDelay(chunks, 0, initialTimestamps)

    return {
        timestamps: timestamps,
        cached: false,
    }
}
