export function def(obj, key, value) {
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: false,
    get () {
      return value
    },
    set (newVal) {
      if (newVal === value) return
      value = newVal
    }
  })
}

// 原型改写继承

export function protoArgument(target: any, src: any) {
  target.__proto__ = src
}

// 赋值改写继承

export function valArgument(target: any, src: any, keys: Array<any>) {
  keys.forEach(key => {
    def(target, key, src[key])
  })
}