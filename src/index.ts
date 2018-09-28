import { lift, partial, wait, chunk, asyncPipe } from './ts/functional/Curry'

let wind: any = window

wind.onload = function () {
  let items = Array.prototype.slice.call(document.querySelectorAll('#lift>li'))
  let colors = ['red', 'yellow', 'blue', 'pink']
  const setColor =  async (node, color) => {
    await wait(1000)
    node.style.backgroundColor = color
  }
  const combin = node => color => [node, color]

  const tasks = lift(combin)(items, colors).map(com => partial(setColor, com))
  const chunkedTasks = chunk(tasks, 4)

  const run = async function(pause) {
    for (let i = 0; i < chunkedTasks.length; i++) {
      await asyncPipe(...chunkedTasks[i])(0)
      await wait(pause)
    }
  }

  run(1000)
}