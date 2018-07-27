import { directiveUtil, isDirective, isEventDirective, isElementNode, isTextNode } from './renderUtil'

const PARAM_REG = /\((.+)\)/g
const STRING_REG = /\'(.*)\'/g
const VAR_REG = /\{\{\{(.*?)\}\}\}|\{\{(.*?)\}\}/g
const HTML_REG = /\{\{\{(.*)\}\}\}/

export default class Render {
  constructor (selector, vm) {
    this.$vm = vm
    this.$el = isElementNode(selector) ? selector : document.querySelector(selector)
    if (this.$el) {
      // 转换node
      this.$fragment = this.createFragment(this.$el)
      // 编译片段
      this.compileElement(this.$fragment)
      this.$el.appendChild(this.$fragment)
    }
  }

  createFragment (el) {
    let fragment = document.createDocumentFragment(),
      child
    // 遍历原始node子节点
    while(child = el.firstChild) {
      fragment.appendChild(child)
    }
    return fragment
  }

  compileElement (el) {
    let childNodes = el.childNodes
    Array.prototype.slice.call(childNodes).forEach(node => {
      let textContent = node.textContent
      const varReg = /\{\{(.*)\}\}/g
      if (isElementNode(node)) {
        this.compileNodeAttr(node)
      } else if (isTextNode(node) && varReg.test(textContent)) {
        this.compileText(node)
      }
    })
  }

  compileNodeAttr (node) {
    const attrs = node.attributes
    let lazyCompiler, lazyExp
    
    Array.prototype.slice.call(attrs).forEach(attr => {
      let attrName = attr.name
      if (isDirective(attrName)) {
        let expression = attr.value
        let directive = attrName.substring(2)
        if (directive === 'for') {
          lazyCompiler = directive
          lazyExp = expression
        } else if (isEventDirective(directive)) {
          directiveUtil.addEvent(node, this.$vm, directive, expression)
        } else {
          // 解析指令不包括for
          directiveUtil[directive] && directiveUtil[directive](node, this.$vm, expression)
        }
      }
      // remove node attr
      node.removeAttribute(attrName)
    })
    // 处理v-for vfor不需要处理子节点
    if (lazyCompiler === 'for') {
      directiveUtil[lazyCompiler] && directiveUtil[lazyCompiler](node, this.$vm, lazyExp)
    } else if (node.childNodes && node.childNodes.length) {
      // 编译子节点
      this.compileElement(node)
    }
  }

  compileText (node) {
    const tokens = this.parseText(node.wholeText)
    // node节点fragment
    let fragment = document.createDocumentFragment()
    tokens.forEach(token => {
      // 对应token的fragment
      let el
      if (token.tag) {
        if (token.html) {
          // 包含需要解析的html
          el = document.createDocumentFragment()
          el.$parent = node.parentNode
          el.$oncetime = true
          directiveUtil.html(el, this.$vm, token.value)
        } else {
          // 响应式节点
          el = document.createTextNode(' ')
          directiveUtil.text(el, this.$vm, token.value)
        }
      } else {
        // 纯文本节点
        el = document.createTextNode(token.value)
      }
      el && fragment.appendChild(el)
    })
    node.parentNode.replaceChild(fragment, node)
  }

  parseText (text) {
    if (!VAR_REG.exec(text)) return
    const tokens = []
    let lastIndex = VAR_REG.lastIndex = 0
    let match, index, html, value
    while(match = VAR_REG.exec(text)) {
      // 第一个匹配到 { 的位置
      index = match.index
      if (index > lastIndex) {
        tokens.push({ value: text.slice(lastIndex, index)})
      }
      html = HTML_REG.test(match[0])
      value = html ? match[1] : match[2]
      tokens.push({
        value,
        html,
        tag: true
      })
      lastIndex = index + match[0].length
    }
    if (lastIndex < text.length) {
      tokens.push({ value: text.slice(lastIndex)})
    }
    return tokens
  }
}