import Vue from "./main"
import Depend from './Depend'

function def(obj, key, value, enumerable?) {
  Object.defineProperty(obj, key, {
    value: value,
    configurable: true,
    enumerable: !!enumerable,
    writable: true
  })
}

export class Observer {
  dep: Depend;
  constructor (data: any) {
    this.dep = new Depend()
    def(data, '__ob__', this)
    if (Array.isArray(data)) {
      this.observeArray(data)
    } else {
      this.walk(data)
    }
  }
  observeArray (data: Array<any>) {

  }
  walk (data: any) {
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }
}

export function observe(data: any) {
  if (!data || typeof data !== 'object') return
  if (data.hasOwnProperty('__ob__' && data['__ob__'] instanceof Observer)) return
  return new Observer(data)
}

function defineReactive(data: any, key: string, value: any) {
    let dep = new Depend()
    let descriptor = Object.getOwnPropertyDescriptor(data, 'configurable')
    if (descriptor && !descriptor.configurable) return
    let childObserver = observe(value)
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get () {
        if (Depend.target) {
          dep.depend()
        }
        return value
      },
      set (newVal: any) {
        if (value === newVal) return
        if (typeof value === 'object') {
          observe(value)
        }
        value = newVal
        dep.notify(newVal, data[key])
      }
    })
}