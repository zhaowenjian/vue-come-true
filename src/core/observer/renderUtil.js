import Watcher from './Watcher'
import Render from './Render';

const PARAM_REG = /\((.+)\)/g
const STRING_REG = /\'(.*)\'/g
const VAR_REG = /\{\{\{(.*?)\}\}\}|\{\{(.*?)\}\}/g
const HTML_REG = /\{\{\{(.*)\}\}\}/

export const directiveUtil = {
  bind: function (node, vm, expression, directive) {
    // 获取指令对应的更新函数 
    const updaterFn = updater[directive]
    // 获取一次vm 中的 expression值 触发一次get  添加watcher
    // const value = this._getVMVal(vm, expression)
    // 更新node值
    // 监听数据值，给watcher添加更新视图的回调
    new Watcher(vm, expression, function (newVal, oldVal) {
      updaterFn && updaterFn(node, newVal, oldVal)
    })
  },
  for: function (node, vm, expression) {
    let itemName = expression.split('in')[0].replace(/\s/g, '')
    // 嵌套data data.data.array
    let arrayName = expression.split('in')[1].replace(/\s/g, '').split('.')
    let range = document.createRange()
    let startNode = document.createTextNode('')
    let endNode = document.createTextNode('')
    let parentNode = node.parentNode

    parentNode.replaceChild(endNode, node)
    parentNode.insertBefore(startNode, endNode)

    let value = vm
    arrayName.forEach(name => value = value[name])

    // 创建节点
    // value.forEach((item, index) => {
    //   let cloneNode = node.cloneNode(true)
    //   parentNode.insertBefore(cloneNode, endNode)
    //   // for vm继承 并增加两个属性
    //   let forVm = Object.create(vm)
    //   // 增加下标
    //   forVm.$index = index
    //   // 绑定item作用域shutexit
    //   forVm[itemName] = item
    //   // 递归编译节点
    //   new Render(cloneNode, forVm)
    // })

    new Watcher(vm, `${arrayName}.length`, function (newVal, oldVal) {
      range.setStart(startNode, 0)
      range.setEnd(endNode, 0)
      range.deleteContents()
      value.forEach((item, index) => {
        let cloneNode = node.cloneNode(true)
        parentNode.insertBefore(cloneNode, endNode)
        let forVm = Object.create(this)
        forVm.$index = index
        forVm[itemName] = item
        new Render(cloneNode, forVm)
      })
    })
  },
  _getVMVal: function (vm, expression) {
    expression = expression.trim().split('.')
    let value = vm
    expression.forEach(key => value = value[key])
    return value
  },
  _setVMVal: function (vm, expression, value) {
    expression = expression.trim().split('.')
    let data = vm._data
    expression.forEach((key, index) => {
      if (index === expression.length - 1) {
        data[key] = value
      } else {
        data = data[key]
      }
    })
  },
  class: function (node, vm, expression) {
    this.bind(node, vm, expression, 'class')
  },
  model: function (node, vm, expression) {
    this.bind(node, vm, expression, 'model')
    let value = this._getVMVal(vm, expression)
    // composing 中文输入优化
    let composing = false
    node.addEventListener('compositionstart', () => {
      composing = true
    }, false)
    node.addEventListener('compositionend', e => {
      composing = false
      if (value !== e.target.value) {
        this._setVMVal(vm, expression, e.target.value)
      }
    }, false)
    node.addEventListener('input', e => {
      if (!composing && value !== e.target.value) {
        this._setVMVal(vm, expression, e.target.value)
      }
    })
  },
  text: function (node, vm, expression) {
    this.bind(node, vm, expression, 'text')
  },
  html: function (node, vm, expression) {
    this.bind(node, vm, expression, 'html')
  },
  addEvent: function (node, vm, directive, expression) {
    let eventType = directive.split(':')
    let fn = vm.$option.methods && vm.$option.methods[expression]
    if (eventType[1] && typeof fn === 'function') {
      node.addEventListener(eventType[1], fn.bind(vm))
    } else {
      const match = PARAM_REG.exec(expression)
      const fnName = expression.replace(match[0], '')
      const paramNames = match[1].split(',')
      fn = vm.$option.methods[fnName]
      let i = 0, params = []
      while(paramNames[i]){
        const name = paramNames[i++].trim()
        const stringMatch = STRING_REG.exec(name)
        if (stringMatch) {
          // 字符串常量
          params.push(stringMatch[1])
        } else {
          // vm 中变量
          params.push(vm[name])
        }
        node.addEventListener(eventType[1], () => {
          fn.apply(vm, params)
        })
      }
    }
  }
}

const cacheDiv = document.createElement('div')

export const updater = {
  text: function (node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value
  },
  html: function (node, value) {
    if (node.$parent) { // {{{}}} 形式绑定的
      cacheDiv.innerHTML = value
      const childNodes = cacheDiv.childNodes
      let doms = []
      let len = childNodes.length
      let tempNode

      if (node.$oncetime) {
        // 第一次进入为fragment
        while (len--) {
          tempNode = childNodes[0]
          node.appendChild(tempNode)
          doms.push(tempNode)
        }
        node.$doms = doms
        node.$oncetime = false
      } else {
        let newFrag = document.createDocumentFragment()
        while (len--) {
          tempNode = childNodes[0]
          newFrag.appendChild(tempNode)
          doms.push(tempNode)
        }
        // 插入新节点
        node.$parent.insertBefore(newFrag, node.$doms[0])
        // 删除原节点
        node.$doms.forEach(childNode => node.$parent.removeChild(childNode))
        node.$doms = doms
      }
    } else {
      // v-html 绑定的
      node.innerHTML = value || ''
    }
  },
  class: function (node, value, oldVal) {
    let classNames = node.className
    if (oldVal) {
      classNames = classNames.replace(oldVal, '').replace(/\s$/, '')
    }
    let space = classNames && value ? ' ' : ''
    node.className = classNames + space + value
  },
  model: function (node, value) {
    node.value = value || ''
  }
}

export function isDirective (attr) {
  return attr.indexOf('v-') != -1
}

export function isEventDirective (dir) {
  return dir.indexOf('on') != -1
}

export function isElementNode (node) {
  return node.nodeType === 1
}

export function isTextNode (node) {
  return node.nodeType === 3
}