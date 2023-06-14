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

export interface HistoryManagerImpl {
    /** 原本的内置管理器 */
    rowHistory: History
    /** 虚拟管理器的history的id，标签页的窗口周期内每个历史记录都会有一个唯一id */
    historyId: number;
    /** 当前页面在历史记录中的位置，最低0，最高49，和stack数组的最大值有关，默认支持记录50条 */
    point: number;
    /** 当前窗口的历史记录栈， 默认支持记录50条,不建议手动修改里面映射的历史记录，该历史记录修改也不会影响到内置历史记录存档*/
    stack: Array<HistoryOptions>;
    /** 历史记录的当前长度 */
    readonly length: number;
    /** 返回后是否保持上次滚动位置 */
    scrollRestoration: 'auto' | 'manual'
    /** 获取当前页面中虚拟管理器正在操作的的历史记录 */
    readonly history: HistoryOptions
    /** 获取当前历史记录的state  */
    state: any

    /**
     *  虚拟历史记录管理器立即完全接管浏览器内置的history，必须挂载
     *  */
    mount(): void

    /** 交还控制权给浏览器内置的history ，不会清除之前的历史记录，如果有需要自己清理stack数组就行 */
    unmount(): void;

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

    /** push一条历史记录 */
    replace(history: HistoryOptions): void

    /** replace一条历史记录,不会切割数组，且会直接替换当前point对应的历史记录 */
    push(history: HistoryOptions): void

    /** 前往对应历史记录id */
    index(id: number): void

    /** 创建一个虚拟管理器专用的历史记录 */
    createHistory(state: any, title: string, url: string): HistoryOptions

    /** 浏览器页面后退时回调，可添加多个,默认为`null */
    onBack(callback: Function): void

    /** 浏览器页面前进时回调，可添加多个,默认为`null */
    onForward(callback: Function): void
}

export interface VirtualController extends HistoryManagerImpl {
    back: Function
    forward: Function
    go: Function
    callBackListener: Function
    callForwardListener: Function
}
