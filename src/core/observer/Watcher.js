import Subject from "./Subject";

export default class Watcher {
  constructor (vm, expression, callback) {
    Subject.target = this
    this.callback = callback
    this.vm = vm
    this.expression = expression
    this.subjectIds = {}
    this.update()
    Subject.target = null
  }
  addSubject (subject) {
    if (!this.subjectIds.hasOwnProperty(subject.id)) {
      this.subjectIds[subject.id] = subject
      subject.addWatcher(this)
    }
  }
  update () {
    this.get()
    if (this.value !== this.oldVal) {
      this.callback.call(this.vm, this.value, this.oldVal)
      this.oldVal = this.value
    }
  }
  get () {
    return this.value = this._getVMVal()
  }
  _getVMVal () {
    let expression = this.expression.split('.')
    let value = this.vm
    expression.forEach(curVal => value = value[curVal])
    return value
  }
}