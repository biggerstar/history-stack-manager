import {EventBusImpl} from "../../../../index";
import {isArray, isFunction} from "../utils/tool";

export class EventBus implements EventBusImpl {
    public listeners: Record<string, Array<Record<string, any>>> = {}

    public $on(name: string, callback: Function): void {
        if (!isArray(this.listeners[name])) this.listeners[name] = []
        if (isFunction(callback)) this.listeners[name].push({callback})
    }

    public $emit(name: string, ...data: any[]): void {
        if (isArray(this.listeners[name])) Array.from(this.listeners[name]).forEach(({callback, rule}) => {   // 使用Array.from是因为$once执行后的$off删除监听器后会影响到正在$emit源listeners的index
            if (rule && rule(...data) !== true) return
            callback.call(this, ...data)
        })
    }

    public $off(name: string, callback: Function): void {
        if (!isArray(this.listeners[name])) return
        for (let i = 0; i < this.listeners[name].length; i++) {
            if (this.listeners[name][i].callback === callback) this.listeners[name].splice(i--, 1)
        }
    }

    public $clear(): void {
        for (const k in this.listeners) {
            delete this.listeners[k]
        }
    }
}
