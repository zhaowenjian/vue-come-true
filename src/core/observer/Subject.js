

export default class Subject {
  constructor () {
  this.watchers = []
  }
  addWatcher (watcher) {
    this.watchers.push(watcher)
  }
  notify () {
    this.watchers.forEach((watcher) => watcher.update())
  }
}