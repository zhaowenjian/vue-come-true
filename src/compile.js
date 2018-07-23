export function node2Fragment(node, vm) {
  const frag = document.createDocumentFragment()
  let child
  while (child = node.firstChild) {
    compile(child, vm)
    frag.appendChild(child)
  }
  return frag
}

function compile(node, vm) {
  const nodeTypeHandler = {
    1: function (node, vm) { // node
      const attrs = node.attributes
      for (let attr of attrs) {
        if (attr.nodeName === 'v-model') {
          node.addEventListener('input', () => { vm.$option.data[attr.nodeValue] = node.value })
        }
      }
    },
    3: function (node, vm) { // text
      const varReg = /\{\{(.*)\}\}/
      varReg.test(node.nodeValue) && (node.nodeValue = vm.$option.data[RegExp.$1.trim()])
    }
  }
  nodeTypeHandler[node.nodeType] && nodeTypeHandler[node.nodeType].call(null, node, vm)
}