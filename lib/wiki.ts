export function constructWikiRequestUrl(config: {
    [key: string]: string
    action: string
    cmcontinue: string
    cmlimit: string
    cmtitle: string
    format: string
}) {
    const url =
        'https://oldschool.runescape.wiki/api.php?' +
        new URLSearchParams(config)
    return url
}

export function constructWikiItemRequestUrl(config: { cmcontinue: string }) {
    return constructWikiRequestUrl({
        action: 'query',
        cmlimit: `500`,
        cmtitle: 'Category:Items',
        format: 'json',
        list: 'categorymembers',
        ...config,
    })
}
