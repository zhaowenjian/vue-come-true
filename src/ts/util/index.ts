

export function isElementNode (node: HTMLElement) : boolean {
  return node.nodeType === 1
}

export function isTextNode (node: HTMLElement) : boolean{
  return node.nodeType === 3
}