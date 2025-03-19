export default class Debug {
    private node: HTMLElement
    private entries: Map<string, string> = new Map()
    constructor() {
        const node = document.querySelector('section') as HTMLElement | null;
        if(node) {
            this.node = node;
        } else {
            const node = document.createElement('section');
            document.body.append(node)

            this.node = node;
        }
    }

    set(entry: string, value: string) {
        if(this.entries.has(entry)) {            
            const node = document.getElementById(`debug-${entry}`) as HTMLElement | null;
            if(!node) return
            
            node.innerText = value;
        } else {
            const node = document.createElement('p');
            node.id = `debug-${entry}`;
            node.innerText = value;
            this.node.append(node);
        }
        this.entries.set(entry, value);
    }
    delete(entry: string) {
        this.entries.delete(entry);

        const node = document.getElementById(`debug-${entry}`) as HTMLElement | null;
        if(!node) return

        node.remove();
    }
}