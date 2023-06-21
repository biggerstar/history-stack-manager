export declare function createHistoryManager(window?: WindowProxy): HistoryManagerImpl

export type HistoryOptions = {
    /** 该管理器历史记录类型标识 */
    type: '__HISTORY_DATA__' | string
    /** 非必要，浏览器的历史原因，传入空字符串就行了 */
    title?: string
    /** 要持久化记录的state */
    state: any
    /** 要添加记录的对应url */
    url: string
    /** 要添加记录的滚动位置  */
    scrollY?: number
    /** 当前记录的唯一id  */
    id: number
}

export interface HistoryManagerImpl extends EventBusImpl {
    /** 内置history对象的历史记录当前长度 */
    readonly length: number;
    /** 返回后是否保持上次滚动位置 */
    scrollRestoration: 'auto' | 'manual'
    /** 获取当前页面中虚拟管理器正在操作的的历史记录，如果当前最新记录是iframe产生的，则history会是进入iframe指向的最后一个操作记录 */
    readonly history: HistoryOptions | null
    /** 获取当前历史记录的state  */
    state: any

    /** 后退 */
    back(): void

    /** 前进 */
    forward(): void

    /** 前往一个偏移量历史记录 */
    go(offset: number): void

    /** push一条历史记录,会同步添加到内置历史记录管理器 */
    replaceState(state: any, title: string, url: string): void

    /** replace一条历史记录，会同步添加到内置历史记录管理器 */
    pushState(state: any, title: string, url: string): void

    /* @notice 以上 接口调用行为和内置管理器的行为并无差异  */

    /** 当前页面在历史记录中的位置，最低0，最高49，和stack数组的最大值有关，默认支持记录50条 */
    point: number;
    /** 当前窗口的历史记录栈， 默认支持记录50条 ，该stack的任何操作函数都不会影响内置管理器行为，只是一个当前window历史记录的一个映射*/
    stack: Array<HistoryOptions>;
    /** 当前虚拟管理器的历史记录的当前长度 */
    readonly len: number;

    /** push一条历史记录 */
    replace(history: HistoryOptions): void

    /** replace一条历史记录,不会切割数组，且会直接替换当前point对应的历史记录 */
    push(history: HistoryOptions): void

    /** 前往对应历史记录id */
    index(id: number): void

    /** 创建一个虚拟管理器专用的历史记录 */
    createHistory(state: any, title: string, url: string): HistoryOptions
}

export interface VirtualController extends HistoryManagerImpl {
    back: Function
    forward: Function
    go: Function
}


export interface EventBusImpl {
    $on(name: string, callback: Function): void

    $emit(name: string, ...data: any[]): void

    $off(name: string, callback: Function): void

    $clear(): void
}

export interface HistoryObserverImpl {
    observer(): void;

    disconnect(): void;
}
