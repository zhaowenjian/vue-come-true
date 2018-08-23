import Depend from "./Depend";
import Vue from './main'


export default class Watcher {
  callBack: Function;
  vm: Vue;
  expression: string;
  depIds: any;
  value: any;
  oldVal: any;
  constructor (vm: Vue, expression: string, callback: Function) {
    Depend.target = this
    this.callBack = callback
    this.vm = vm
    this.expression = expression
    this.depIds = {}
    this.update()
    Depend.target = null
  }
  addDep (dep: Depend) {
    if (!this.depIds.hasOwnProperty(dep.uid)) {
      this.depIds['' + dep.uid] = dep
      dep.addWatcher(this)
    }
  }
  update () {
    this.get()
    if (this.value !== this.oldVal) {
      this.callBack.call(this.vm, this.value, this.oldVal)
      this.oldVal = this.value
    }
  }
  get () {
    return this.value = this._getVMVal()
  }
  _getVMVal () {
    let expression = this.expression.split('.')
    let value = this.vm
    expression.forEach(key => value = value[key])
    return value
  }
}