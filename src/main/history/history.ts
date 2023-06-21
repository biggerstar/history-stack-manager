import {patchHistoryEvent} from "./unit/patchHistoryEvent";
import {HistoryObserver} from "./unit/HistoryObserver";
import {initHistoryManager} from "./unit/HistoryManager";
import {reProxyHistoryState} from "./unit/reProxyHistoryState";

/**  @deprecated 已弃用下方注释解析所描述，现已改其他实现方式，保留只为了记录该实现方案懒得写md */

/** 方案1
 * HistoryManager是一个模拟内置的history管理器API且扩充其他功能的虚拟历史记录管理器，
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

/** 方案2
 * 实现了监听记录当前window中所有产生的历史记录并取得控制权，实现历史记录栈和支持浏览器的后退和前进事件
 * 简称: 可识别记录 === 可被该虚拟管理器识别的history
 * 1.通过监听popstate，所有的记录操作符合浏览器内置规则，在里面通过规则判断是否前往了新的url，
 * 如果有则在合适时候将其state替换成可识别记录，并在每次历史记录操作的时候同步到sessionStorage中(详见syncHistory文件)
 * 2.通过拦截pushState和replaceState添加操作，该操作不会触发popstate需要单独处理，拦截后也在合适时机替换成可识别记录
 * 3.在首次进入页面的时候记录并替换成可识别记录
 * */
//------------------------------------------------------------------------------------------------
export function _createHistoryManagerFactory(window) {
    //---------------------------------------------------------------------
    const historyManager = initHistoryManager(window)
    patchHistoryEvent(window, historyManager)  // 第一次运行为当前指定的window增加两个历史记录操控事件
    reProxyHistoryState(window)
    const historyObserver = new HistoryObserver(window, historyManager)
    historyObserver.observer()
    return historyManager
}

