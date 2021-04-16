const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// 匹配开始标签开始部分
const startTagOpen = new RegExp(`^<${qnameCapture}`)
// 匹配开始标签结束部分
const startTagClose = /^\s*(\/?)>/

// 匹配结束标签
const endTag = new RegExp(`^<\/${qnameCapture}[^>]*>`)
// 匹配注释
const comment = /^<!--/
/**
 * 解析html模板
 * @param {*} temp 模板字符串
 * @param {*} options 回调函数配置
 */

export function parseHTML(temp, options) {
    // 
    let checkStack = []
    // 转存模板 用于分析并截取
    let html = temp
    // 字符串索引位置
    let index = 0
    while (html) {
        const textStart = html.indexOf('<')
        if (textStart === 0) {
            // =0 可能是注释或者开始标签
            // 优先判断是不是注释
            if (html.match(comment)) {
                const commentEnd = html.indexOf('-->')
                if (commentEnd >= 0) {}
                advance(commentEnd + 3)
                continue
            }
            // 判断是否是开始标签
            const startTagMatch = parseStartTag()
            if (startTagMatch) {
                handleStartTag(startTagMatch)
            }
            // 判断是否是结束标签
            const endTagMatch = html.match(endTag)
            if(endTagMatch){
                advance(endTagMatch[0].length)
                //TODO 
                parseEndTag(endTagMatch[1])
            }
        }
        // 大于等于0 说明前面有文本
        let text
        if (textStart >=0){
            text = html.slice(0,textStart)
            advance(textStart)
        }
        // 小于0 说明是纯文本
        if (textStart < 0){
            text = html
            html = ''
        }
        // 处理纯文本
        if(options.chars){
            options.chars(text)
        }
    }
    /**
     * 处理匹配开始标签的属性,并且把当前元素添加到checkStack,调用回调函数
     * 返回标签名称,属性,是否是单标签
     * @param {*} match 匹配开始标签自定义的结果
     */
    function handleStartTag(match) {
        let tagName = match.tagName
        let unaryTag = match.isUnary
        // 属性处理
        let attrs = []
        attrs.length = match.attrs.length
       
        for (let i = 0; i < attrs.length; i++) {
            attrs[i] = {
                name:match.attrs[i][1],
                value:match.attrs[i][3] 
            }
        }
        //判断是不是单标签
        let isunary = isUnaryTag(tagName) || !!unaryTag
        //如果不是
        if(!isunary){
            checkStack.push({
                tag:tagName,
                attrs,
                lowerCaseTag:tagName.toLowerCase()
            })
        }
        // 通过回调函数调用
        if(options.start){
            options.start(tagName,attrs,isunary)
        }
    }   
    /**
     * 处理结束标签
     * @param {*} tagName 标签名称
     */
    function parseEndTag(tagName) {
        // 
        let pos,lowerCaseTagName
        if(tagName){
            lowerCaseTagName = tagName.toLowerCase()
            // 
            // 从数组的最后一位开始匹配有没有对应的开始标签
            for (pos = checkStack.length-1; pos >= 0; pos--) {
                // 
                if(checkStack[pos].lowerCaseTag === lowerCaseTagName){
                    break
                }
            }
        }else{
            pos = 0
        }
        // 当找到pos 在checkStack中校验是否为当前顶部的标签,否则抛出异常,执行end操作
        if(pos>=0){
            for (let i = checkStack.length-1; i >= pos; i--) {
                if(i>pos || !tagName){
                    
                    throw `标签 ${checkStack[i].tag}没有匹配的闭合标签`
                } 
                options.end && options.end()       
                checkStack.length = pos // 清空栈  
            }
        }

    }
    /**
     * 匹配开始标签
     * 返回匹配后自定义的内容:标签名称和属性
     */
    function parseStartTag() {
        ///匹配开始标签
        const start = html.match(startTagOpen)
        if (start) {
            let match = {
                tagName: start[1],
                attrs: [],
                start: index
            }
            advance(start[0].length)
            let end, attr
            // 匹配开始标签的结束符号,如果匹配成则结束,如果没匹配到则匹配属性
            // 如果匹配到属性则添加到match的attrs中
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
               
                match.attrs.push(attr)
                // 
                advance(attr[0].length)
            }
            if(end){
                // 自闭和标签 end[1]是 / 否则 end[1]是 '' >
                match.isUnary = end[1]
                match.end = index
                advance(end[0].length)
                return match
            }

        }
    }
    /**
     * 处理html字符串的截取
     * @param {*} n 当前需要截取多少长度的字符串 
     */
    function advance(n) {
        index += n
        html = html.substring(n)
    }
    /**
     * 判断标签是不是单标签
     * @param {*} tagName 
     * @returns 
     */
    function isUnaryTag(tagName) {
        const unaryTag = `br,hr,img,input,param,meta,link`
        return unaryTag.split(',').indexOf(tagName) >= 0 
    }

}