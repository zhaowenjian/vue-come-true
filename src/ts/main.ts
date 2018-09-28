
import { Observer, observe } from './Observer'
import Compiler from './Compiler'

export default class Vue {
  $option: any;
  _data: any;
  $compiler: Compiler;
  $observer: Observer;
  constructor (option: any) {
    this.$option = option
    this._data = option.data
    this._proxy(this._data)
    this.$observer = observe(this._data)
    this.$compiler = new Compiler(this, option.el)
  }
  _proxy (data: any) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get () {
          return this._data[key]
        },
        set (newVal: any) {
          this._data[key] = newVal
        }
      })
    })
  }
}

global.Vue = Vue