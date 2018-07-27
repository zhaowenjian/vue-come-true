
let uid = 0

export default class Subject {
  
  static target;

  constructor () {
    this.id = uid++
    this.watchers = []
  }

  depend () {
    Subject.target.addSubject(this)
  }

  addWatcher (watcher) {
    this.watchers.push(watcher)
  }

  removeWatcher (watcher) {
    let index = this.watchers.indexOf(watcher)
    if (index != -1) {
      this.watchers.splice(index, 1)
    }
  }
  notify () {
    this.watchers.forEach((watcher) => watcher.update())
  }
}