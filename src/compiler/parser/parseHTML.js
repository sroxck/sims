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
    console.log(temp, '333');
    // 用于存放临时找到的开始标签和属性
    // 当找到了对应的结束标签的时候,则说明html格式正确,否则报错提示
    let checkStack = []
    // 转存模板 用于分析并截取
    let html = temp
    // 当前已分析到的字符串索引的位置
    let index = 0
    while (html) {
        const textStart = html.indexOf('<')
        if (textStart === 0) {
            // =0 可能是注释或者开始标签
            // 优先判断是不是注释
            if (html.match(comment)) {
                const commentEnd = html.indexOf('-->')
                if (commentEnd >= 0) {
                    //todo 匹配到注释,回调函数
                }
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
                console.log(endTagMatch,'endTagMatchend');
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
            console.log(text,html,'text-html textStatr <0');
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
        // 正则匹配到的属性
        // 0: "id="app""
        // 1: "id"
        // 2: "="
        // 3: "app"
        for (let i = 0; i < attrs.length; i++) {
            attrs[i] = {
                name:match.attrs[i][1],
                value:match.attrs[i][3] 
            }
        }
        console.log(attrs,'attrs');
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

        // console.log(tagName,"tagNametagName");
        let pos,lowerCaseTagName
        if(tagName){
            lowerCaseTagName = tagName.toLowerCase()
            // console.log(lowerCaseTagName,'lowerCaseTagNamelowerCaseTagName');
            // 从数组的最后一位开始匹配有没有对应的开始标签
            for (pos = checkStack.length-1; pos >= 0; pos--) {
                // console.log(checkStack[pos].lowerCaseTag,'checkStack[pos].lowerCaseTag');
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
                    console.warn(`标签 ${checkStack[i].tag}没有匹配的闭合标签`)
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
        console.log(start,'start开始标签');
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
                 // 正则匹配到的属性
                // 0: "id="app""
                // 1: "id"
                // 2: "="
                // 3: "app"
                match.attrs.push(attr)
                advance(attr[0].length)
            }
            console.log(match,'match');
            // 如果end就是匹配到的 > 或者 />
            if(end){
                // 自闭和标签 end[1]是 / 否则 end[1]是 ''  end匹配出来的是组 分0 和1  0是>
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
        console.log(html,'html截取的');
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