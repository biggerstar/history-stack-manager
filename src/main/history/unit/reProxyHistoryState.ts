import {getCurState, isTiHistory} from "../utils/tool";

export function reProxyHistoryState(window: Window) {
    Object.defineProperty(window.history, "state", {
        get: () => {
            const state = getCurState(window)
            return isTiHistory(state) ? state.state : state
        },
        configurable:true,
        enumerable:true
    })
}


