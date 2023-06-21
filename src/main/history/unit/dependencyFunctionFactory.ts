import {HistoryManagerImpl} from "../../../../index";
import {syncHistory} from "./syncHistory";
import {isFunction} from "../utils/tool";


/** iframe中的state和topWindow不是同一个,如果操作iframe产生新的历史记录，用的state还是topWindow最后的一个state */
export function dependencyFunctionFactory(window: Window, historyManager: HistoryManagerImpl) {

    /**  监听历史记录pop动作，并实现后退和前进的监听,iframe触发的onpopstate不会被响应，只会响应当前window */
    function onPopstate() {
        syncHistory(window, historyManager)
    }

    function onPushState(ev) {
        const after = ev.after
        ev.after = () => {
            if (isFunction(after)) after()
            syncHistory(window, historyManager)
            console.log('onPushState', ev)
        }
    }

    function onReplaceState(ev) {
        const after = ev.after
        ev.after = () => {
            if (isFunction(after)) after()
            syncHistory(window, historyManager)
            console.log('onReplaceState', ev)
        }
    }

    return {
        onPopstate,
        onPushState,
        onReplaceState,
    }

}

