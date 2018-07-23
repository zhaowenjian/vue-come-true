import { initData } from './observer'
import { node2Fragment } from './compile'

export default class Vue {
  constructor (option) {
    this.$option = option
    if (option.data) {
      initData(option.data, this)
    }
    if (option.el) {
      const dom = document.getElementById(option.el)
      dom.append(node2Fragment(dom, this))
    }
  }
}

global.Vue = Vue