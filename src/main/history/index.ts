import {HistoryManagerImpl} from "../../../index";
import {_createHistoryManagerFactory} from "./history";

export function createHistoryManager(targetWindow?): HistoryManagerImpl {
  if (!targetWindow) targetWindow = window // 没传入目标window默认使用运行环境的window
  return _createHistoryManagerFactory(targetWindow)
}
