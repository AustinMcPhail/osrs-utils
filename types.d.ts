declare global {
    interface Window {
        cv: any
    }
}

export interface Root<QueryResultType> {
    batchcomplete: string
    continue?: QueryContinue
    query: QueryResultType
}

export interface CatagoryQuery {
    categorymembers: Categorymember[]
}

export interface Categorymember {
    pageid: number
    ns: number
    title: string
}

export interface QueryContinue {
    cmcontinue: string
    continue: string
}

type Item = {
    pageId: number
    lastRevisionTimestamp?: string
}
type Items = {
    [key: string]: Item
}
type RevisionTimestamps = {
    [key: string]: string
}

export interface ContentQuery {
    normalized: Normalized[]
    pages: Pages
}

export interface Normalized {
    from: string
    to: string
}

export interface Pages {
    [key: string | number]: Page
}

export interface Page {
    pageid: number
    ns: number
    title: string
    revisions: Revision[]
}

export interface Revision {
    contentformat: string
    contentmodel: string
    '*': string
}
