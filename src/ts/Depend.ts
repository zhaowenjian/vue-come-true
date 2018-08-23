import Watcher from './Watcher'

let uid = 0

export default class Depend  {
  uid: Number;
  deps: Array<Watcher>
  static target: Watcher;
  constructor () {
    this.uid = uid++
    this.deps = []
  }
  depend () {
    Depend.target.addDep(this)
  }
  addWatcher (watcher: Watcher) {
    this.deps.push(watcher)
  }
  notify (newVal: any, oldVal: any) {
    this.deps.forEach(watcher => watcher.update())
  }
  removeDep () {

  }
}