export interface INode {
  element: HTMLElement;
  parent: Node | null;
  children: Node[];
}

export class Node {
  node: INode;

  constructor() {
    this.node = {
      element: this.createElement(),
      children: [],
      parent: null,
    };
  }

  createElement() {
    return document.createElement("div");
  }

  addChild(child: Node) {
    const { children, element } = this.node;
    children.push(child);
    child.parent = this;
    element.appendChild(child.element);
  }

  // getters

  get parent() {
    return this.node.parent;
  }

  get children() {
    return this.node.children;
  }

  get element() {
    return this.node.element;
  }

  // setters

  set<F extends Object, T>(state: F, key: keyof F, value: any) {
    const oldValue = state[key];
    state[key] = value;
    this.change(key as string, oldValue, value);
  }

  set parent(node: Node | null) {
    this.set(this.node, "parent", node);
  }

  set children(array: Node[]) {
    this.set(this.node, "children", array);
  }

  set element(element: HTMLElement) {
    this.set(this.node, "element", element);
  }

  // apply

  change(key: string, oldValue: any, newValue: any) {
    // console.log({ key, oldValue, newValue });
    this.render();
  }

  renderStyle() {
    return `transition: all 0.5s ease;`;
  }

  render() {
    const style = this.renderStyle();
    this.element.style.cssText = style;
  }
}
