import Vue from './main'
import Watcher from './Watcher'

const VAR_REG = /\{\{(.*?)\}\}|\{\{\{(.*?)\}\}\}/g
const HTML_REG = /\{\{\{(.*?)\}\}\}/g

const DirectiveUpdater = {
  text (node: HTMLElement, newVal: any, oldVal?: any) {
    node.textContent = newVal || ''
  }
}

class Directive {
  bind (el: HTMLElement, vm: Vue, expression: string, directive: string) {
    const updaterFn = DirectiveUpdater[directive]
    new Watcher(vm, expression, function (newVal: any, oldVal: any) {
      updaterFn && updaterFn(el, newVal, oldVal)
    })
  }
  text (el: HTMLElement, vm: Vue, expression: string) {
    this.bind(el, vm, expression, 'text')
  }
  html (el: HTMLElement, vm: Vue, expression: string) {
  }
}

export default new Directive()