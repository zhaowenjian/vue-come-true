
class Vue {
  $options: Object;
  constructor (options: Object)  {
    this.$options = options
  }
}

global.Vue = Vue