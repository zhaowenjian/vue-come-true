import Depend from './Depend'
import Vue from './main'

export default class {

  vm: Vue;

  expression: string;

  value: any;

  oldVal: any;

  callBack: Function;
  
  constructor (vm: Vue, expression: string, callBack: Function) {
    Depend.target = this
    this.vm = vm
    this.expression = expression
    this.callBack = callBack
    this.get()
    Depend.target = null
  }

  addDep (dep: Depend) {
    dep.addWatcher(this)
  }

  update () {
    this.get()
    if (this.value !== this.oldVal) {
      this.callBack(this.value, this.oldVal)
    }
  }

  get () {
    return this.value = this._getVMVal()
  }

  _getVMVal () {
    this.oldVal = this.value
    const expressions = this.expression.split('.')
    let val = this.vm
    expressions.forEach(expression => val = val[expression])
    return val
  }

}