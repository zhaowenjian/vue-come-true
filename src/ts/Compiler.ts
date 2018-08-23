import Vue from './main'
import { isElementNode, isTextNode } from './util/index'
import Directve from './Directive'

const tagReg = /\{\{\{(.*?)\}\}\}|\{\{(.*?)\}\}/g
const htmlReg = /^\{\{\{(.*?)\}\}\}$/g

export class Compiler {
  $el: HTMLElement;
  $vm: Vue;
  $fragment: DocumentFragment;
  constructor (vm: Vue, el: any) {
    this.$vm = vm
    this.$el = isElementNode(el) ? el : document.querySelector(el)
    if (this.$el) {
      // 转换node
      this.$fragment =this.createFragment(this.$el)
      // 编译片段
      this.compileFragment(this.$fragment)
      // 插入片段
      this.$el.appendChild(this.$fragment)   
    }
  }
  compileFragment (node: DocumentFragment) {
    let childNodes = node.childNodes
    let tagreg = /\{\{(.*?)\}\}|\{\{\{(.*?)\}\}\}/g
    Array.prototype.slice.call(childNodes).forEach(node => {
      let textContent = node.textContent
      if (isElementNode(node)) {
        this.compileNodeAttr(node)
      } else if (isTextNode(node) && tagreg.test(textContent)){
        this.compileText(node)
      }
    })
  }
  compileNodeAttr (node: HTMLElement) {

  }
  compileText (node) {
    let tokens = this.parseText(node.wholeText)
    let fragment = document.createDocumentFragment()
    tokens.forEach(token => {
      let el
      if (token.tag) {
        if (token.html) {
          // 包含需解析的html片段
          el = document.createDocumentFragment()
          el.$parent = node.parentNode
          el.$onceTime = true
          Directve.html(el, this.$vm, token.value)
        } else {
          // 响应节点
          el = document.createTextNode('')
          Directve.text(el, this.$vm, token.value)
        }
      } else {
        // 普通文本
        el = document.createTextNode(token.value)
      }
      el && fragment.appendChild(el)
    })
    node.parentNode.replaceChild(fragment, node)
  }
  parseText (text: string): Array<any> {
    if (!tagReg.test(text)) return
    let tokens = []
    let lastIndex = tagReg.lastIndex = 0
    let match, index, html, value
    while (match = tagReg.exec(text)) {
      index = match.index
      if (index > lastIndex) {
        tokens.push({
          value: text.slice(lastIndex, index)
        })
      }
      html = htmlReg.test(match[0])
      value = html ? match[1] : match[2]
      tokens.push({
        value,
        html,
        tag: true
      })
      lastIndex = index + match[0].length
    }
    if (lastIndex < text.length) {
      tokens.push({value: text.slice(lastIndex)})
    }
    return tokens
  }
  createFragment (el: HTMLElement): DocumentFragment {
    let fragment = document.createDocumentFragment()
    let child
    while (child = el.firstChild) {
      fragment.appendChild(child)
    }
    return fragment
  }
}

