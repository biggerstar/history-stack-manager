import {getCurState, getHistoryStorage, isTiHistory, setHistoryStorage} from "../utils/tool";
import {HistoryManagerImpl} from "../../../../index";

/** 为什么使用sessionStorage ?
 * 1. 因为能保证在同一窗口创建的historyId唯一，
 * 2. 支持在historyManager管理的界面跳到任何一个界面之后，
 * 3. 支持被其他historyManager环境的地方给捕捉到，且支持go(num),
 *    比如访问顺序同源界面1 -> 其他topWindow加载的跨域站点(或者iframe跨域站) -> 同源界面2，此时从同源2直接go(x)到同源界面1能被监听到back操作，反之一样
 * 4. 支持任何形式的刷新后还能监控到前进后退
 * 原理: 在内置历史记录管理器原本默认操作完成后，运行syncHistory，这时候会有rowReplaceState替换该历史记录成虚拟管理器支持的数据
 * options.force 强制添加
 * */
export function syncHistory(window: WindowProxy, historyManager: HistoryManagerImpl, options: { force?: boolean, replace?: boolean } = {}) {
    const History = window['History']
    const rowReplaceState = History.prototype.rowReplaceState || History.prototype.replaceState
    let popAction = ''
    const isGotoNewUrl = options.force === true || !isTiHistory(getCurState(window))   // 为null时是前往新hash或者url ，后退的话会加载读取到之前的历史记录
    const historyData = getHistoryStorage(window) || {}
    const before = historyData['cur']

    if (isGotoNewUrl) {  // 如果当前state是null说明前往新的地址，为该地址创建一条state记录,iframe会添加一条新记录,但是state还是上一个的state,iframe创建的这里的isGotoNewUrl为false
        const state = getCurState(window)
        const customState = isTiHistory(state) ? null : state
        const history = historyManager.createHistory(customState, '', window.location.href)
        rowReplaceState.call(window.history, history, '', '')
        if (options.replace === true) historyManager.replace(history)
        else historyManager.push(history)
    }

    const curState = getCurState(window)
    if (isTiHistory(curState) && isTiHistory(before)) {  // 只管理虚拟管理器创建的记录，因为可能还有部分位置会创建记录的情况，比如location的replace和assign， 还需完善
        historyManager.index(curState.id)
        if (before.id === curState.id) return  // 此时是比如点击a标签锚点，但是不会同步添加历史记录,只是单纯跳转
        popAction = before.id > curState.id ? 'back' : 'forward'
        historyManager.$emit('popstate', curState.state)
        if (['back', 'forward'].includes(popAction)) historyManager.$emit(popAction, curState.state)  // 发起前进后退事件
    }

    setHistoryStorage(window, {
        before: before || curState,
        cur: curState
    })
    // console.log('history len', history.length);
    // console.log('isGotoNewUrl', isGotoNewUrl)
    // console.log('before', before?.id, 'cur', curState?.id);
    // console.log('action', popAction);
}
