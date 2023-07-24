import { ContentQuery, Items, Root } from '@/types'
import { readFile } from 'fs/promises'
import { constructWikiRequestUrl } from './wiki'

export async function getInfoboxes(items: Items): Promise<{
    infoboxes: any
    cached: boolean
}> {
    try {
        const cachedInfoboxes = await readFile('cache/infoBoxes.json', 'utf-8')
        if (cachedInfoboxes) {
            console.log('Found cached infoboxes, infoboxes.json')
            return {
                infoboxes: JSON.parse(cachedInfoboxes),
                cached: true,
            }
        }
    } catch (error) {
        console.log('No cached infoboxes found, infoboxes.json')
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
        infoBoxes: { [key: string]: any }
    ): Promise<any> => {
        if (chunks.length === 0) {
            return infoBoxes
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
            rvprop: 'content',
            cmcontinue: '',
            cmlimit: '',
            cmtitle: '',
        })
        const response = await fetch(url)
        const data = (await response.json()) as Root<ContentQuery>

        await new Promise((resolve) =>
            setTimeout(resolve, MILLISECONDS_BETWEEN_REQUESTS)
        )

        return await fetchChunksWithDelay(rest, iteration + 1, {
            ...infoBoxes,
            ...Object.entries(data.query.pages)
                .filter(([key, value]) => {
                    return value.revisions
                })
                .reduce((acc, [key, content]) => {
                    const item = first.find(
                        (item) => item.pageId === Number(key)
                    )
                    if (!item) {
                        throw new Error(
                            `Could not find item with pageId ${key}`
                        )
                    }
                    if (content.revisions[0]['*'].includes('{{Infobox Item')) {
                        const infoboxText = content.revisions[0]['*']
                            .split('{{Infobox Item')[1]
                            .split('}}')[0]
                        const values = infoboxText
                            .split('\n')
                            .filter((line) => {
                                return line.includes('=')
                            })
                            .map((line) => {
                                const [k, v] = line.split('=')
                                return {
                                    key: k.split('|')[1].trim(),
                                    value: v.trim(),
                                }
                            })

                        const images = values
                            .find((value) => value.key === 'image')
                            ?.value.split('[[')
                            .filter((image) => image.includes(']]'))
                            .map((image) => image.split(']]')[0])
                            .map((image) => {
                                const originalFileName = image.split('File:')[1]
                                const fileNameWithUnderscores =
                                    originalFileName.replace(/ /g, '_')
                                const fileUrl = `https://oldschool.runescape.wiki/images/${fileNameWithUnderscores}`
                                return fileUrl
                            })

                        const quest = values.find(
                            (value) => value.key === 'quest'
                        )?.value
                        const examine = values
                            .filter((value) => value.key.includes('examine'))
                            ?.map((value) => value.value)
                        const tradeable = values.find(
                            (value) => value.key === 'tradeable'
                        )?.value
                        const stackable = values.find(
                            (value) => value.key === 'stackable'
                        )?.value
                        const equipable = values.find(
                            (value) => value.key === 'equipable'
                        )?.value
                        const placeholder = values.find(
                            (value) => value.key === 'placeholder'
                        )?.value
                        const noteable = values.find(
                            (value) => value.key === 'noteable'
                        )?.value
                        const destroy = values.find(
                            (value) => value.key === 'destroy'
                        )?.value

                        const infobox = {
                            images,
                            quest:
                                quest === 'No'
                                    ? []
                                    : quest
                                          ?.split('[[')
                                          .filter((q) => q.includes(']]'))
                                          .map((q) => {
                                              return q.split(']]')[0]
                                          }),
                            examine,
                            tradeable: tradeable === 'Yes',
                            stackable: stackable === 'Yes',
                            equipable: equipable === 'Yes',
                            placeholder: placeholder === 'Yes',
                            noteable: noteable === 'Yes',
                            destroyable: destroy != undefined,
                        }

                        return {
                            ...acc,
                            [item.key]: infobox,
                        }
                    } else {
                        return {
                            ...acc,
                        }
                    }
                }, {}),
        })
    }

    const initialInfoBoxes = {}
    const infoboxes = await fetchChunksWithDelay(chunks, 0, initialInfoBoxes)

    return {
        infoboxes,
        cached: false,
    }
}
