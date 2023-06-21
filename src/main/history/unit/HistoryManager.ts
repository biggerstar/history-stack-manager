import {EventBus} from "./EventBus";
import {HistoryManagerImpl, HistoryOptions} from "../../../../index";
import {__HISTORY_DATA__} from "../constant";
import {getCurState, getHistoryStorage, isTiHistory} from "../utils/tool";
import {syncHistory} from "./syncHistory";


export function initHistoryManager(window: Window): HistoryManagerImpl {
    /** 创建一个用于当前window环境且仅限当前window环境的虚拟管理器的历史记录，
     * iframe也有自己的window，可以新建一个管理器自己独立管理 */
    class HistoryManager extends EventBus implements HistoryManagerImpl {
        //-----------------上面这些字段是实现和内置history对象完全一致的API------------------
        public [Symbol.toStringTag] = 'History'

        public get length(): number {
            return window.history.length
        }

        public get scrollRestoration() {
            return window.history.scrollRestoration
        }

        public set scrollRestoration(type) {
            window.history.scrollRestoration = type
        }

        public get state(): any {
            let state = getCurState(window)
            return isTiHistory(state) ? state.state : state

        }

        public back(): void {
            window.history.go(-1)
        }

        public forward(): void {
            window.history.go(1)
        }

        public go(step: number = 0): void {
            window.history.go(step)
        }

        public replaceState(state: any, title: string, url: string): void {
            window.history.replaceState(history, title, url)
        }

        public pushState(state: any, title: string, url: string): void {
            window.history.pushState(this.stack[this.point], title, url)
        }

        //---------------------------下面是拓展功能-----------------------------//
        constructor() {
            super();
            syncHistory(window, this, {force: true})  // 添加第一次访问的记录
        }

        public point: number = 0  // 指向当前页面对应历史记录下标,0起最大默认49，共50条记录
        public stack: Array<HistoryOptions> = []

        public get len(): number {
            return this.stack.length
        }

        public get history(): HistoryOptions | null {
            let state = getCurState(window)
            return isTiHistory(state) ? state.state : null
        }

        public index(id: number) {
            for (let i = 0; i < this.stack.length; i++) {
                const history = this.stack[i]
                if (history.id === id) {
                    this.point = i
                    break
                }
            }
        }

        public replace(history: HistoryOptions): void {
            this.stack[this.point] = history
        }

        public push(history: HistoryOptions): void {
            if (this.stack.length >= 50) this.stack.shift()  // 超过长度去除最先记录
            this.stack.push(history)
            this.point = this.stack.length - 1
        }

        public createHistory(state: any, title: string, url: string): HistoryOptions {
            const scrollY = window.scrollY
            this.stack.splice(this.point + 1, this.stack.length - this.point - 1)  // 在栈中间push会截断后面记录，最低保留一个当前页记录
            url = (new URL(url, window.location.href)).href
            const history = getHistoryStorage(window)
            let beforeId = history && history.cur ? history.cur.id : 0
            return {
                type: __HISTORY_DATA__,
                url,
                state,
                title,
                scrollY,
                id: ++beforeId
            }
        }
    }

    return new HistoryManager()
}

