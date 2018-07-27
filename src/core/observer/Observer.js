import Subject from './Subject'
import { arrayMethods } from './array'
import { def } from './util'

// 原型改写继承
function protoArgument(target, src) {
  target.__proto__ = src
}
// 赋值改写继承
function argument(target, src, keys) {
  keys.forEach(key => def(target, key, src[key]))
}

export function observe(data) {
  if (!data || typeof data　!== 'object') return
  if (data.hasOwnProperty('__ob__') && data['__ob__'] instanceof Observer) return
  return new Observer(data)
}

class Observer {
  constructor (data) {
    this.subject = new Subject() // 数组改变时，通知变化  并没有depend ？？？
    def(data, '__ob__', this)
    this._data = data
    if (Array.isArray(data)) {
      // 更改data的原型继承（7个方法改写，array元素有改变时对添加元素observe：__ob__即为此用途）
      const argument = data.__proto__ ? protoArgument : argument
      argument(data, arrayMethods, Object.keys(arrayMethods))
      this.observeArray(data)
    } else {
      this.walk(data)
    }
  }
  observeArray (arr) {
    let i = 0
    while(arr[i]) {
      observe(arr[i++])
    }
  }
  walk (data) {
    Object.keys(data).forEach(key => this.defineReactive(data, key, data[key]))
  }
  defineReactive (data, key, value) {
    let subject = new Subject(),
      descriptor = Object.getOwnPropertyDescriptor(data)
    if (descriptor && !descriptor.configurable) return
    const childObserver = observe(value)
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get () {
        if (Subject.target) {
          // 添加watcher
          subject.depend()
          if (childObserver) {
            childObserver.subject.depend()
          }
        }
        return value
      },
      set (newVal) {
        if (value === newVal) return
        if (typeof newVal === 'object') {
          observe(newVal)
        }
        value = newVal
        subject.notify()
      }
    })
  }
}