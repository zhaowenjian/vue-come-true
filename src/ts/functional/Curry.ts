
// functor 待映射数据
// ap 映射函数数组

function flatten(arr:Array<any>) {
  return arr.reduce((prev, curr) => prev.concat(curr), [])
}

export function ap(fns: Array<Function>) {
  return xs => flatten(fns.map(f => xs.map(f)))
}

export function chunk(arr: Array<any>, size: Number) {
  return arr.reduce((chunked, item) => {
    let last = chunked[chunked.length - 1]
    if (!last || last.length === size) {
      chunked.push([item])
      return chunked
    }
    last.push(item)
    return chunked
  }, [])
}

export function wait(ms:Number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function partial(func:Function, args) {
  return function (...inargs){
    console.log(args)
    return func.apply(this, args.concat(inargs))
  }
}

export function lift(func: Function) {
  return (head, ...tail) => tail.reduce((fns, xs) => ap(fns)(xs), head.map(func))
}

export function asyncPipe (...funcs) {
  return (x: any) => funcs.reduce(async (prev, curr) =>  curr(await prev), x)
}

export function pipe(...fns) {
  return (...args) => fns.reduce((prev, curr) => curr.apply(this, args), args)
}