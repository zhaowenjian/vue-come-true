import { def } from './util/index'

Object._create = (obj) => {
  const func = () => {}
  func.prototype = obj
  return new func()
}

const arrayProto = Array.prototype

export const arrayMthods = Object._create(arrayProto)

const observeArray = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']

observeArray.forEach(method => {
  const original = arrayProto[method]
  def(arrayMthods, method, function (...args) {
    const res = original.apply(this. args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;    
      case 'splice':
        inserted = args.slice(2)
        break;
    }
    inserted && ob.observeArray(inserted)
    ob.subject.notify()
    return res
  })
})