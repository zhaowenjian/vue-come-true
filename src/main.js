import { observe } from "./core/observer/Observer";
import { render } from "./core/observer/render";


export default class Vue {
  constructor (option) {
    this.$option = option
    if (this.$option.data) {
      this.$observer = observe(this, this.$option.data)
    }
    if (this.$option.el) {
      const dom = document.getElementById(this.$option.el)
      dom.appendChild(render(this, dom))
    }
  }
}

global.Vue = Vue