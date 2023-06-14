import {HistoryManagerImpl, HistoryOptions, VirtualController} from "../../index.d.ts";

/** 已经99% 实现内置history管理器的所有功能
 * HistoryManager是一个模拟内置的history管理器API且扩充其他功能的虚拟历史记录管理器，会替代并接管内置管理器,
 * 任何API监听即将操作并执行相关逻辑，和内置管理器 [互不影响且同时进行] ，部分动作会操作内置API ，
 * 在有虚拟管理器的页面会接管内置管理器，但是虚拟管理器依赖内置管理器的持久化记录功能。
 * ** 内置浏览器添加历史记录的几种情况,当前已全部实现监听 **
 * [1].点击a链接
 * [2].在地址栏中输入加载URL或者打开新界面
 * [3].提交表单
 * [4].history对象的pushState和replaceState
 * [5].location对象的replace和assign （唯一不完美实现[原因是location的replace和assign不可重定义]: assign和replace在虚拟管理器中都会添加新纪录；但是内置管理器是正常的，assign添加一个记录，replace替换当前页记录）
 * 实现方式:
 * 注: pathname,protocol,origin,query等等不变 只有hash改变的情况，后面简称"只变hash"，相反称"非只变hash"
 * 浏览器DOMContentLoaded事件: 非只变hash下实现了 [1] [2] [3] [5]
 * 浏览器hashchange事件: 只变hash下实现了 [1] [2] [5]
 * HistoryManager管理类: 实现了[4]
 * */

const __HISTORY_DATA__ = '__HISTORY_DATA__'

const extractGetter = (target: object, field: string) => {
    if (Object.getOwnPropertyDescriptor) return Object.getOwnPropertyDescriptor(target, field).get
    else return target['__lookupGetter__'](field)
}

const isTiHistory = (state) => state && typeof state === 'object' && state?.type === __HISTORY_DATA__

//------------------------------------------------------------------------------------------------
export function _createHistoryManagerFactory(window) {
    const rowHistory = window.history
    window.rowHistory = rowHistory
    let historyManager: HistoryManagerImpl
    let mounted = false
    const rowGetterState: Function = extractGetter(History.prototype, 'state')
    const onBackList = []
    const onForwardList = []
    //---------------------------------------------------------------------
    const virtualController = {
        back() {
            const nextPoint = this.point - 1
            if (nextPoint < 0) return /*到最后一个直接退出*/
            this.point = nextPoint
        },
        go(step) {
            const nextPoint = this.point + step
            if (nextPoint < 0) return
            if (nextPoint > this.stack.length - 1) return
            this.point = nextPoint
        },
        forward() {
            const nextPoint = this.point + 1
            if (nextPoint > this.stack.length - 1) return
            this.point = nextPoint
        },
        index(id: number) {
            for (let i = 0; i < this.stack.length; i++) {
                const history = this.stack[i]
                if (history.id === id) {
                    this.point = i
                    break
                }
            }
        },
        callBackListener(state) {
            onBackList.forEach(listen => listen(state))
        },
        callForwardListener(state) {
            onForwardList.forEach(listen => listen(state))
        }
    } as VirtualController

    const getCurHistory = (): HistoryOptions | null => {
        return rowGetterState.call(rowHistory)
    }

    /** 将指定的url同步到内置历史记录的state做持久化存储
     * @param isForce 是否强制添加当前页记录
     * @param newURL 要添加同步的当前url
     * */
    function syncHistory(newURL: string, isForce?: boolean) {
        const isGotoNewUrl = isForce === true ? true : getCurHistory() === null   // 为null时是前往新hash或者url ，后退的话会加载读取到之前的历史记录
        if (isGotoNewUrl) {
            const history = historyManager.createHistory(null, '', newURL)
            historyManager.push(history)   // 添加到虚拟管理器做映射
            rowHistory.replaceState(history, '', newURL)  // 将当前虚拟历史记录做持久化存储
        }
        //---------------------------------------------------
        const curHistory = <HistoryOptions>getCurHistory()
        const isHistory: boolean = isTiHistory(curHistory)
        if (isHistory) virtualController.index.call(historyManager, curHistory.id)  // 将虚拟管理器游标和当前内置管理器提供的id同步
    }

    //---------------------------------------------------------------------
    /** 浏览器输入url加载网站时添加历史记录 */
    function onGoToNewUrl() {
        syncHistory(window.location.href)
    }

    /**  监听hash改变,无页面跳转只改变hash */
    function onHashchange(ev: HashChangeEvent) {
        syncHistory(ev.newURL)
    }

    /**  监听input标签提交表单时包含hash不会自动跳转被onGoToNewUrl和onHashchange监控到时手动同步到虚拟管理器 */
    function onInputTagIncludeHashSync(ev: Event) {
        const target = ev.target || ev['srcElement'] || ev['fromElement']
        const isSubmitTag = target.type === 'submit'
        if (['INPUT', 'BUTTON'].includes(target.tagName) && isSubmitTag) {
            syncHistory(window.location.href, !!window.location.hash)
        }
    }

    /**  监听历史记录pop动作，并实现后退和前进的监听 */
    function onPopstate(ev: PopStateEvent) {
        const state = ev.state
        if (isTiHistory(state)) {  // 只管理虚拟管理器创建的记录，因为可能还有部分位置会创建记录的情况，比如location的replace和assign， 还需完善
            // console.log(historyManager.point, 'before', historyManager.history, 'now', state);
            // 只要state是虚拟管理器的记录，则前进后退后必然需要操控虚拟管理器的游标和事件进行同步
            let beforeHistory = historyManager.history
            const beforeAction = beforeHistory.id > state.id ? 'back' : 'forward'
            if (beforeAction === 'back') virtualController.callBackListener(state.state)
            if (beforeAction === 'forward') virtualController.callForwardListener(state.state)
        }
    }

    /** 网页卸载之前将数据存入sessionStorage中进行窗口生命周期内的持久化 */
    function beforeunloadSaveHistory() {
        window.sessionStorage.setItem(__HISTORY_DATA__, JSON.stringify({
            historyId: historyManager.historyId,
            history: historyManager.stack,
            point: historyManager.point,
            length: historyManager.stack.length,
        }))
    }

    /** 创建一个用于虚拟管理器的历史记录，每次运行该函数historyId都会自增 */

    return class HistoryManager implements HistoryManagerImpl {
        public historyId: number  // 保存在会话session中，窗口存在且在TIYI应用中历史记录的id都是唯一的
        public point: number  // 指向当前页面对应历史记录下标,0起最大默认49，共50条记录
        public stack: Array<HistoryOptions>
        public rowHistory: History
        public [Symbol.toStringTag] = 'History'

        constructor() {
            historyManager = this
            this.rowHistory = rowHistory
            /* -------------------------拿到上次缓存的历史记录并载入-----------------------------------*/
            const localHistory = JSON.parse(window.sessionStorage.getItem(__HISTORY_DATA__)) || {}
            this.stack = localHistory.history ? localHistory.history : []
            this.point = typeof localHistory.point === 'number' ? localHistory.point : 0
            this.historyId = typeof localHistory.historyId === 'number' ? localHistory.historyId : 1
            this.onBack(() => virtualController.back.call(<object>this))
            this.onForward(() => virtualController.forward.call(<object>this))
        }

        public get length(): number {
            return this.stack.length
        }

        public get scrollRestoration() {
            return rowHistory.scrollRestoration
        }

        public set scrollRestoration(val) {
            rowHistory.scrollRestoration = val
        }

        public get history(): HistoryOptions {
            return this.stack[this.point]
        }

        public get state(): any {
            return this.history.state
        }

        public onBack(callback: Function) {
            onBackList.push(callback)
        }

        public onForward(callback: Function) {
            onForwardList.push(callback)
        }

        public index(id: number) {
            if (!mounted) return
            const oldPoint = this.point
            virtualController.index.call(<object>this, id)
            const newPoint = this.point
            const offset = newPoint - oldPoint
            if (offset !== 0) rowHistory.go(offset)
        }

        public replace(history: HistoryOptions): void {
            this.stack[this.point] = history
        }

        public push(history: HistoryOptions): void {
            if (this.stack.length >= 50) this.stack.shift()  // 超过长度去除最先记录
            this.stack.push(history)
            this.point = this.stack.length - 1
        }

        public back(): void {
            if (!mounted) return
            rowHistory.go(-1)
        }

        public forward(): void {
            if (!mounted) return
            rowHistory.go(1)
        }

        /** 相对当前位置前往指定偏移量记录 */
        public go(step: number = 0): void {
            if (!mounted) return
            virtualController.go.call(<object>this)
            rowHistory.go(step)
        }

        public replaceState(state: any, title: string, url: string): void {
            if (!mounted) return
            const oldId = this.stack[this.point].id
            const history: HistoryOptions = this.createHistory(state, title, url)
            history.id = oldId  // 继承原来的id保证history正序
            this.replace(history)
            rowHistory.replaceState(history, title, url)
        }

        public pushState(state: any, title: string, url: string): void {
            if (!mounted) return
            const history: HistoryOptions = this.createHistory(state, title, url)
            this.push(history)
            rowHistory.pushState(this.stack[this.point], title, url)
        }

        public createHistory(state: any, title: string, url: string): HistoryOptions {
            const scrollY = window.scrollY
            this.stack.splice(this.point + 1, this.stack.length - this.point - 1)  // 在栈中间push会截断后面记录，最低保留一个当前页记录
            url = (new URL(url, location.href)).href
            return {
                type: __HISTORY_DATA__,
                url,
                state,
                title,
                scrollY,
                id: this.historyId++
            }
        }

        /** 接管原本的history工作,可以选择不挂载接管，不接管的话，replaceState，pushState，back,forward,go同样是可以使用的 */
        public mount(): void {
            if (mounted) return
            else mounted = true
            window.addEventListener("DOMContentLoaded", onGoToNewUrl)
            window.addEventListener("click", onInputTagIncludeHashSync)
            window.addEventListener("hashchange", onHashchange)
            window.addEventListener("popstate", onPopstate)
            window.addEventListener("beforeunload", beforeunloadSaveHistory)
            Object.defineProperty(window, 'history', {value: this, enumerable: true})
        }

        /** 将history工作交还给原本的管理器 */
        public unmount(): void {
            if (!mounted) return
            else mounted = false
            window.removeEventListener("DOMContentLoaded", onGoToNewUrl)
            window.removeEventListener("click", onInputTagIncludeHashSync)
            window.removeEventListener("hashchange", onHashchange)
            window.removeEventListener("popstate", onPopstate)
            window.removeEventListener("beforeunload", beforeunloadSaveHistory)
            Object.defineProperty(window, 'history', {value: rowHistory, enumerable: true})
            Object.defineProperty(rowHistory, 'state', {  // 代理还原之前历史记录的state
                get: function () {
                    const state = rowGetterState.call(rowHistory)
                    return isTiHistory(state) ? state.state : state
                },
                configurable: true,
                enumerable: true
            })
        }
    }
}

