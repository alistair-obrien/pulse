export abstract class ComponentModel<T extends Component<any>> {
    abstract readonly component: new () => T;
}

export abstract class Component<TModel> {

    protected model!: Readonly<TModel>;

    readonly root: HTMLElement;

    constructor(tag = "div") {
        this.root = document.createElement(tag);
    }

    set className(className: string) {
        this.root.className = className;    
    }

    get style():CSSStyleDeclaration { return this.root.style; }

    append(...children: (HTMLElement | Component<any>)[]) {
        this.root.append(
            ...children.map(c => c instanceof Component ? c.root : c)
        );
    }

    update(model: Readonly<TModel>) {
        this.model = model;
        this.render();
    }

    protected abstract render(): void;
}