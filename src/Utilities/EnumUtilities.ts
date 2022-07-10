// Why this is not a straightforwardly solved problem in Anno Domini Two Thousand and Twenty Two is beyond me :)
// https://www.petermorlion.com/iterating-a-typescript-enum/
export function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}