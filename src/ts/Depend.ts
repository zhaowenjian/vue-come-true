
import Watcher from './Watcher'

let id = 0
export default class Depend  {

  id: Number;

  static target: Watcher;

  deps: Array<Watcher>;

  constructor () {
    this.id = id++
    this.deps = []
  }

  depend () {
    Depend.target.addDep(this)
  }

  addWatcher (watcher: Watcher) {
    this.deps.push(watcher)
  }

  notify () {
    this.deps.forEach(watcher => watcher.update())
  }

}

