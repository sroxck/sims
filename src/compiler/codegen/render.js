function render(AST) {
    const element = document.createElement(AST.tag)
    AST.attrslist.forEach(attr => {
        element.setAttribute(attr.name, attr.value)
    });
    handleChildrenElement(AST.children, element)
    return element
}
function handleChildrenElement(AST, root) {
    if(AST instanceof Array){
        AST.forEach(item => {
            if (item.type === 1) {
                const element = document.createElement(item.tag)
                item.attrslist.forEach(attr => {
                    if(attr.name.indexOf('tag-model') != -1){
                        attr.value = attr.value.replace(/&nbsp;/g,' ')
                        attr.value = attr.value.replace(/&gt;/g,'>')
                        attr.value = attr.value.replace(/&lt;/g,'<')
                        attr.value = attr.value.replace(/&quot;/g,'"')
                        attr.value = attr.value.replace(/&quot;/g,'"')
                        attr.value = attr.value.replace(/&apos;/g,`'`)
                        item[attr.name] = attr.value
                    }
                    element.setAttribute(attr.name, attr.value)
                });
                // 添加到父级
                root.appendChild(element)
                item.children &&item.children.length>0&& handleChildrenElement(item.children, element)
            } else if (item.type === 2 ) {
                root.innerHTML += item.text
            }
        });
    }
}