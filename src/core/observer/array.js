import { def } from "./util";

Object._create = function(obj) {
  const func = function () {}
  func.prototype = obj
  return new func()
}

const arrayProto = Array.prototype

export const arrayMethods = Object._create(arrayProto);

['push',
 'pop',
 'shift',
 'unshift',
 'splice',
 'sort',
 'reverse'].forEach(method => {
  const original = arrayProto[method]
  // 覆盖原始方法
  def(arrayMethods, method, function (...args) {
    const res = original.apply(this, args)
    // 调用这些方法时重新observe
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.splice(2)
        break;
    }
    inserted && ob.observeArray(inserted)
    // 触发数组对象的update
    ob.subject.notify()
    return res
  })
});