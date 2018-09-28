import Vue from './main'
import Watcher from './Watcher'
import Compiler from './Compiler';

let cacheDiv = document.createElement('div')
let temp

const updaterMap = {

  text (node: HTMLElement, newVal: string, oldVal: string) {
    node.textContent = newVal || ''
  },

  html (node: any, newVal: string, oldVal: string) {
    //当node为text节点时对应的流程（解析value到node里）
    if (node.$parent) {
      // {{{}}}html解析，传进来的node是一个空的fragment，得特殊处理
      cacheDiv.innerHTML = newVal;
      const childNodes = cacheDiv.childNodes,
          doms = [];
      let len = childNodes.length,
          tempNode;
      //html第一次更新进入的流程
      if (node.$onceTime) {
          while (len--) {
              tempNode = childNodes[0];
              node.appendChild(tempNode);
              doms.push(tempNode);
          }
          node.$doms = doms;
          node.$onceTime = false;
      } else {
          // 在之后更新节点时进入的流程
          let newFragment = document.createDocumentFragment();
          while (len--) {
              tempNode = childNodes[0];
              newFragment.appendChild(tempNode);
              doms.push(tempNode);
          }
          // 插入新的节点
          node.appendChild(newFragment);
          // 删除原来的节点
          node.$doms.forEach(childNode => {
            node.removeChild(childNode);
          });
          // 保存新节点引用，下次用来删除
          node.$doms = doms;
      }

    } else {
        // v-html指令
        node.innerHTML = newVal || '';
    }
  },

  model (node, value) {
    node.value = value || ''
  },

  class (node, value, oldVal) {
    let classNames = node.className
    if (oldVal) {
      classNames = classNames.replace(oldVal, '').replace(/\s$/, '')
    }
    let space = classNames && value ? ' ' : '';
    node.className = classNames + space + value
  }
}
class Directive {

  addEvent (node: HTMLElement, vm: Vue, directive: string, expression: string) {
    let eventName = /:(\w+)/.exec(directive)[1]

    let fn = vm.$option.methods && vm.$option.methods[expression]

    if (eventName && typeof fn === 'function') {
      node.addEventListener(eventName, fn.bind(vm))
    } else {
      // 带参数fn
      let match = /(.+)\.(\((.+)\))/.exec(expression)
      let fnName = match[1]
      let paramNames = match[2].split[',']
      let params = []

      fn = vm.$option.methods[fnName]

      paramNames.forEach((param, index) => {
        let name = param.trim()
        if (/\'(.+)\'/.exec(param)) {
          params.push[param]
        } else {
          params.push(vm[name])
        }
      })

      node.addEventListener(eventName, () => {
        fn.apply(vm, params)
      })
    }

  }

  model (node: HTMLElement, vm: Vue, expression: string) {

    this.bind(node, vm, expression, 'model')

    let value = this._getVMVal(vm, expression)

    let composing = false

    node.addEventListener('compositionstart', () => {
      composing = true
    })

    node.addEventListener('compositionend', (event: any) => {
      composing = false
      if (value !== event.target.value) {
        this._setVMVal(vm, expression, event.target.value)
      }
    })

    node.addEventListener('input', (event: any) => {
      if (!composing && value !== event.target.value) {
        this._setVMVal(vm, expression, event.target.value)
      }
    })
  }

  class (el: HTMLElement, vm: Vue, expression: string) {
    this.bind(el, vm, expression, 'class')
  }

  text (el: HTMLElement, vm: Vue, expression: string) {
    this.bind(el, vm, expression, 'text')
  }

  html (el: HTMLElement, vm: Vue, expression: string) {
    this.bind(el, vm, expression, 'html')
  }

  for (el: HTMLElement, vm: Vue, expression: string) {
    let itemName = expression.split('in')[0].replace(/\s/g, '')
    let arrayName = expression.split('in')[1].replace(/\s/g, '').split('.')
    let parentNode = el.parentNode
    let startNode = document.createTextNode('')
    let endNode = document.createTextNode('')
    let range = document.createRange()

    parentNode.replaceChild(endNode, el)
    parentNode.insertBefore(startNode, endNode)

    let value: any = vm
    arrayName.forEach(name => value = value[name])

    value.forEach((item, index) => {
      let cloneNode = el.cloneNode(true)
      parentNode.insertBefore(cloneNode, endNode)
      let forVm = Object.create(vm)
      forVm.$index = index
      forVm[itemName] = item
      new Compiler(forVm, cloneNode)
    });

    new Watcher(vm, arrayName + '.length', function (newValue: any, oldValue: any) {
      range.setStart(startNode, 0)
      range.setEnd(endNode, 0)
      range.deleteContents()

      value.forEach((item, index) => {
        let cloneNode = el.cloneNode(true)
        parentNode.insertBefore(cloneNode, endNode)
        let forVm = Object.create(this)
        forVm.$index = index
        forVm[itemName] = item
        new Compiler(forVm, cloneNode)
      });
      
    })

  }

  bind (el: HTMLElement, vm: Vue, expression: string, directive: string) {
    const value = this._getVMVal(vm, expression)
    const updaterFn = updaterMap[directive]
    updaterFn(el, value)
    new Watcher(vm, expression, function (newVal: any, oldVal: any) {
      updaterFn && updaterFn(el, newVal, oldVal)
    })
  }

  _getVMVal (vm: Vue, expression: string) {
    let expressions = expression.split('.')
    let value = vm
    expressions.forEach(expression => {
      value = value[expression]
    })
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return value
  }

  _setVMVal (vm: Vue, expression: string, value: any) {
    let expressions = expression.split('.')
    let data = vm._data
    expressions.forEach((expression, index) => {
      if (index === expressions.length - 1) {
        data[expression] = value
      } else {
        data = data[expression]
      }
    })
  }
}

export default new Directive()