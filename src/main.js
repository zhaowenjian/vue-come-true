import { observe } from "./core/observer/Observer";
import Render from "./core/observer/Render";


export default class Vue {
  constructor (option) {
    this.$option = option
    this._data = this.$option.data
    // 监听数据
    Object.keys(this.$option.data).forEach(key => this._proxy(key))
    this.$observer = observe(this.$option.data)
    // 编译节点
    this.$compiler = new Render(this.$option.el || document.body, this)
  }
  _proxy (key) {
    const _this = this
    Object.defineProperty(this, key, {
      configurable: false,
      enumerable: true,
      get () {
        return _this._data[key]
      },
      set (newVal) {
        _this._data[key] = newVal
      }
    })
  }
}

global.Vue = Vue