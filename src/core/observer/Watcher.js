import Subject from "./Subject";


export default class Watcher {
  constructor (vm, node, name) {
    Subject.target = this
    this.$vm = vm
    this.$node = node
    this.$name = name
    this.update()
    Subject.target = null
  }
  update () {
    this.get()
    this.$node.nodeType === 3 && (this.$node.nodeValue = this.value)
    this.$node.nodeType === 1 && (this.$node.value = this.value)
  }
  get () {
    this.value = this.$vm[this.$name]
  }
}