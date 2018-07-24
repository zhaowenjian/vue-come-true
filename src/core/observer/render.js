import Watcher from './Watcher'

export function render(vm, node) {
  const frag = document.createDocumentFragment()
  let child
  while (child = node.firstChild) {
    compile(vm, child)
    frag.appendChild(child)
  }
  return frag
}

function compile(vm, node) {
  const nodeHandler = {
    1: function (vm, node) {
      const attrs = node.attributes
      for (let attr of attrs) {
        if (attr.nodeName === 'v-model') {
          const name = attr.nodeValue
          node.addEventListener('input', (e) => vm[name] = e.target.value)
          new Watcher(vm, node, name)
        }
      }
    },
    3: function (vm, node) { // text
      const variableReg = /\{\{(.*)\}\}/
      if (variableReg.test(node.nodeValue)) {
        const name = RegExp.$1.trim()
        new Watcher(vm, node, name)
      }
    }
  }
  nodeHandler[node.nodeType] && nodeHandler[node.nodeType].call(this, vm, node)
}