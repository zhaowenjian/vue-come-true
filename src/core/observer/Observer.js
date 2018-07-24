import Subject from "./Subject";


export function observe(vm, data) {
  return new Observer(vm, data)
}

class Observer {
  constructor (vm, data) {
    const keys = Object.keys(data)
    for(let key of keys) {
      this.defineReactive(vm, key, data[key])
    }
  }
  defineReactive (vm, key, val) {
    const subject = new Subject()
    Object.defineProperty(vm, key, {
      get () {
        if (Subject.target) subject.addWatcher(Subject.target)
        return val
      },
      set (newVal) {
        if (val === newVal) return
        val = newVal
        subject.notify()
      }
    })
  }
}