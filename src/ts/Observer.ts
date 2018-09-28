import Vue from './main'
import Depend from './Depend'
import { def, valArgument, protoArgument } from './util/index'
import { arrayMethods } from '../core/observer/array';

export class Observer {

  dep: Depend;

  constructor (data: any) {
    this.dep = new Depend()
    def(data, '__ob__', this)
    if (Array.isArray(data)) {
      // 更改数组的原型继承 array元素改变时添加observe
      const argument = data['__proto__'] ? valArgument : protoArgument
      argument(data, arrayMethods, Object.keys(arrayMethods))
      this.observeArray(data)
    } else {
      this.walk(data)
    }
  }

  observeArray (data: Array<any>) {
    for (let item of data) observe(item)
  }

  walk (data: any) {
    Object.keys(data).forEach(key => this.defineReactive(data, key, data[key]))
  }

  defineReactive (obj: any, key: string, value: any) {
    let descriptor = Object.getOwnPropertyDescriptor(obj, key)
    if (descriptor && !descriptor.configurable) return
    const dep = new Depend()
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: false,
      get () {
        if (Depend.target) {
          dep.depend()
        }
        return value
      },
      set (newVal: any) {
        if (newVal === value) return
        if (typeof newVal === 'object') {
          observe(newVal)
        }
        value = newVal
        dep.notify()
      }

    })
  }
}

export function observe(data:any) {
  if (!data || typeof data !== 'object') return
  if (data.__ob__ && data.__ob__ instanceof Observer) return
  return new Observer(data)
}