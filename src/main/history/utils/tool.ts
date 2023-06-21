import {__HISTORY_DATA__} from "../constant";

export const isFunction = (data: any): data is Function => typeof data === 'function';
export const isArray = (data: any): data is Array<any> => Array.isArray(data);
export const isTiHistory = (state) => state && typeof state === 'object' && state?.type === __HISTORY_DATA__
/** 提取某个键值定义的getter */
export const extractGetter = (target: object, field: string) => {
    if (Object.getOwnPropertyDescriptor) return Object.getOwnPropertyDescriptor(target, field).get
    else return target['__lookupGetter__'](field)
}

export function getHistoryStorage(window: Window) {
    return JSON.parse(window.sessionStorage.getItem(__HISTORY_DATA__))
}

export function setHistoryStorage(window: Window, data: any) {
    window.sessionStorage.setItem(__HISTORY_DATA__, JSON.stringify(data))
}

export function getCurState(window) {
    const rowGetterState: Function = window['History'].prototype['rowGetterState']
        || extractGetter(window['History'].prototype, 'state')
    if (!window['History'].prototype['rowGetterState']) window['History'].prototype['rowGetterState'] = rowGetterState
    return rowGetterState.call(window.history)
}
