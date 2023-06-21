import {__PUSH_STATE_EVENTNAME__, __REPLACE_STATE_EVENTNAME__} from "../constant";
import {HistoryManagerImpl} from "../../../../index";
import {isFunction} from "../utils/tool";

/** 为某个window环境增加 historyPushState，historyReplaceState 浏览器自定义事件 */
export const patchHistoryEvent = function (window: Window, historyManager) {
    const History = window['History']
    const Event = window['Event']
    if (!History) return
    const rowPushState = History.prototype.pushState
    const rowReplaceState = History.prototype.replaceState

    class HistoryEvent extends Event {
        // 支持直接修改下面参数以改变添加到历史记录中的数据
        public isPrevent = false
        public state: any = null
        public title: string = ''
        public url: string = ''
        public manager: HistoryManagerImpl = historyManager

        public preventDefault() {
            this.isPrevent = true
        }

        public after: Function
    }

    function initHistoryEvent(event: HistoryEvent, args: IArguments) {
        event.state = args[0]
        event.title = args[1]
        event.url = args[2]
        event.manager = historyManager
    }

    History.prototype['rowPushState'] = rowPushState
    History.prototype['rowReplaceState'] = rowReplaceState
    //---------------------------------------------------
    History.prototype.pushState = function () {
        const event = new HistoryEvent(__PUSH_STATE_EVENTNAME__)
        initHistoryEvent(event, arguments)
        window.dispatchEvent(event)
        if (!event.isPrevent) rowPushState.call(this, event.state, event.title, event.url)
        if (isFunction(event.after)) event.after()   // after 是执行默认操作后要手动执行的操作，由外部事件回调函数中挂载的
    }
    History.prototype.replaceState = function () {
        const event = new HistoryEvent(__REPLACE_STATE_EVENTNAME__)
        initHistoryEvent(event, arguments)
        window.dispatchEvent(event)
        if (!event.isPrevent) rowReplaceState.call(this, event.state, event.title, event.url)
        if (isFunction(event.after)) event.after()
    }
}





