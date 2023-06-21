import {HistoryManagerImpl, HistoryObserverImpl} from "../../../../index";
import {__PUSH_STATE_EVENTNAME__, __REPLACE_STATE_EVENTNAME__} from "../constant";
import {dependencyFunctionFactory} from "./dependencyFunctionFactory";


export class HistoryObserver implements HistoryObserverImpl {
    private DF: object  /* dependFunction*/

    constructor(window: Window, historyManager: HistoryManagerImpl) {
        this.DF = dependencyFunctionFactory(window, historyManager)
    }

    public observer() {
        window.addEventListener(__PUSH_STATE_EVENTNAME__, this.DF.onPushState)
        window.addEventListener(__REPLACE_STATE_EVENTNAME__, this.DF.onReplaceState)
        window.addEventListener("popstate", this.DF.onPopstate)
    }

    public disconnect() {
        window.removeEventListener(__PUSH_STATE_EVENTNAME__, this.DF.onPushState)
        window.removeEventListener(__REPLACE_STATE_EVENTNAME__, this.DF.onReplaceState)
        window.removeEventListener("popstate", this.DF.onPopstate)
    }
}
