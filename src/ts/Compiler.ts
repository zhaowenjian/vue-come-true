
import Depend from './Depend'
import Watcher from './Watcher'
import Vue from './main'
import { isElementNode, isTextNode } from './util/index'
import Directive from './Directive'

const tagReg = /\{\{\{(.*)\}\}\}|\{\{(.*?)\}\}/g
const htmlReg = /\{\{\{(.*)\}\}\}/g

export default class Compiler {
  
  $vm: Vue;

  $el: HTMLElement;

  constructor (vm: Vue, el: any) {
    this.$vm = vm
    this.$el = isElementNode(el) ? el : document.querySelector(el)
    if (this.$el) {
      // 转化node
      let fragment = this.createFragment(this.$el)
      // 编译
      this.compile(fragment)
      // 插入
      this.$el.appendChild(fragment)
    }
  }

  compile (fragment: DocumentFragment) {
    let childNodes = fragment.childNodes
    Array.prototype.slice.call(childNodes).forEach(node => {
      let textContent = node.textContent
      let tagReg = /\{\{\{(.*)\}\}\}|\{\{(.*?)\}\}/g
      if (isElementNode(node)) {
        this.compileNodeAttr(node)
      } else if (isTextNode(node) && tagReg.test(textContent)) {
        this.compileText(node)
      }
    })
  }

  compileNodeAttr (node) {
    let attrs = node.attributes
    let lazyCompiler
    let lazyExpression
    [].slice.call(attrs).forEach(attr => {
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        let expression = attr.value
        let directive = attrName.substring(2)
        if (directive === 'for') {
          lazyCompiler = directive
          lazyExpression = expression
        } else if (this.isEventDirective(directive)) {
          Directive.addEvent(node, this.$vm, directive, expression)
        } else {
          Directive[directive] && Directive[directive](node, this.$vm, expression)
        }
      }
      node.removeAttribute(attrName)
    })
    if (lazyCompiler === 'for') {
      Directive[lazyCompiler] && Directive[lazyCompiler](node, this.$vm, lazyExpression)
    } else if (node.childNodes && node.childNodes.length) {
      this.compile(node)
    }
  }

  isDirective (attrName: string) {
    return attrName.indexOf('v-') === 0
  }

  isEventDirective (directive: string) {
    return directive.indexOf('on') === 0
  }

  compileText (node: HTMLElement) {
    let cacheDiv
    const tokens = this.parseText(node.textContent)
    let fragment = document.createDocumentFragment()
    tokens.forEach(token => {
      let el
      if (token.tag) {
        if (token.html) {
          el = document.createElement('div')
          el.$parent = node.parentNode
          el.$onceTime = true
          Directive.html(el, this.$vm, token.value)
        } else {
          el = document.createTextNode('')
          Directive.text(el, this.$vm, token.value)
        }
      } else {
        el = document.createTextNode(token.value)
      }
      el && fragment.appendChild(el)
    })
    node.parentNode.replaceChild(fragment, node)
  }

  parseText (text: string) {
    let tokens = []
    let lastIndex = tagReg.lastIndex = 0
    let match, index, html, value
    while (match = tagReg.exec(text)) {
      index = match[0]
      if (index > lastIndex) {
        tokens.push({value: text.slice(lastIndex, index)})
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

  createFragment (el: HTMLElement) {
    let fragment = document.createDocumentFragment()
    let childNode
    while (childNode = el.firstChild) {
      fragment.appendChild(childNode)
    }
    return fragment
  }

}
