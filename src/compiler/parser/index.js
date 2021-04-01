import { parseHTML } from './parseHTML'
/**
 * 
 * @param {*} template 要解析的模板
 * @returns 
 */
export function parse(template) {
    console.log(template,'template');
    //最终返回出去的AST对象
    let root 
    // 当前元素的父级元素
    let currentParent
    // 生成AST的临时栈
    let stack = []
    //假设可以获取到开始,结束标签和纯文本
    parseHTML(template,{
        //匹配开始标签
        start:(tag,attrs,unary)=>{
            // 创建AST元素
            // type,tag,parent,children,attrlist
            let element = {
                // 自定义type:1 元素节点,2 纯文本
                type:1,
                tag,
                attrslist:attrs,
                parent:currentParent,
                children:[]
            }
            // TODO 属性处理
            // 第一次进入开始标签说明是根节点
            // 所以vue根节点必须只有一个
            if(!root){
                root = element
            }
            if(currentParent){
                // 如果有父级元素,那么设置当前元素添加到父级元素的children里
                // 然后设置当前元素的parent属性就是当前的父级元素
                currentParent.children.push(element)
                element.parent = currentParent
            }
            if(!unary){
                currentParent = element
                stack.push(element)
            }
        },
        //匹配结束标签
        end:()=>{
            // 栈删除匹配的元素
            stack.length-=1
            // 设置当前父级元素
            currentParent = stack[stack.length-1]
        },
        //匹配文本内容
        chars:(text)=>{
            if(!currentParent) return
            const children = currentParent.children
            if(text.trim()){
                // TODO 需要把text文本转换成可以执行的表达式
                let expression = ''
                children.push({
                    type:2,
                    text,
                    expression
                })
            }
        }
    })
    return root
}