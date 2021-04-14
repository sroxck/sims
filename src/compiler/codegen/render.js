export function render(AST) {
    let root
    if (AST.parent == undefined) {
        if (AST.type == 1) {
            root = document.createElement(AST.tag)
            AST.attrslist.forEach(item => {
                console.log(item);
                root.setAttribute(item.name, item.value)
            })
        }
        let child
        AST.children.forEach(item => {
            if (item.type == 1) {
                child = document.createElement(item.tag)

                item.attrslist.forEach(item1 => {
                    if (item1.name.indexOf('@') != -1) {
                        let str = item1.name.slice('1')
                        child.setAttribute(`s-on:${str}`, item1.value)

                    } else {
                        child.setAttribute(item1.name, item1.value)

                    }
                })
                root.appendChild(child)
            }
            item.children.forEach(k => {
                if (k.type == 2) {
                    child.innerHTML = k.text
                }
            })
        })
    }
    return root
}