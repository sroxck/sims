import Watcher from "../core/observer/watcher"
import { parse } from './AST'
import { render } from './codegen/render'


export default class Compiler {
	constructor(context) {
		this.$el = context.$el// 数据转存
		this.context = context
		if (this.$el) {
			let AST = parse(this.$el.outerHTML)
			console.log(AST);
			// console.log(render(AST),'render');
			// 1 把原始dom转换为documentFragment文档片段
			this.$fragment = this.nodeToFragment(this.$el)
			this.context.$created()
			// 编译模板
			this.compiler(this.$fragment)
			// 把文档片段添加到页面中
			this.$el.appendChild(this.$fragment)
		}
	}
	/**
	 * 把所有的元素转换为文档片段
	 * @param {*} node 
	 */
	
	nodeToFragment(node) {
		let fragment = document.createDocumentFragment()
		if (node.childNodes && node.childNodes.length) {
			node.childNodes.forEach(child => {
				// 判断是不是我们需要添加的节点(标签),注释和换行不添加
				// 如果没有忽略
				if (!this.ignorable(child)) {
					fragment.appendChild(child)
				}
			})
		}
		return fragment
	}
	/**
	 * 忽略哪些节点不添加到文档片段
	 * 忽略了返回是true 否则是false
	 * @param {*} node 
	 */
	ignorable(node) {
		var reg = /^[\t\n\r]+/
		return (node.nodeType === 8 || (node.nodeType === 3 && reg.test(node.textContent)))
	}
	/**
	 * 模板编译
	 * @param {*} node 
	 */
	compiler(node) {
		// 创建一个空白的文档片段 document.createDocumentFragment() fragment是一个指向空DocumentFragment对象的引用
		// Fragment比dom有更好的性能
		if (node.childNodes && node.childNodes.length) {
			node.childNodes.forEach(child => {
				if (child.nodeType === 1) {
					// 当type为1 说明是元素节点
					this.compilerElementNode(child)
				} else if (child.nodeType === 3) {
					// 当type为3 说明是文本节点
					this.compilerTextNode(child)
				}
			})
		}
	}
	/**
	 * 编译元素节点
	 * @param {*} node 
	 */
	compilerElementNode(node) {
		let that = this
		// TODO 完成元素的编译,包含指令等
		let attrs = [...node.attributes]
		attrs.forEach(attr => {
			let { name: attrName, value: attrValue } = attr
			if (attrName.indexOf("s-") === 0) {
				let dirName = attrName.slice(2);
				switch (dirName) {
					case "text":
						new Watcher(attrValue, this.context, newValue => {
							node.textContent = newValue
						})
						break;
					case "model":
						if(node.tagName.toLowerCase() === 'input'){
							new Watcher(attrValue, this.context, newValue => {
								node.value = newValue
							})
							node.addEventListener("input",e=>{
								that.context[attrValue] = e.target.value
							})
							
						}
						break;
				}
			}
			if (attrName.indexOf("@") === 0 ){
				this.compilerMethods(this.context,node,attrName,attrValue)
			}
		})
		this.compiler(node)
	}
	/**
	 * 函数编译
	 * @param {*} scope 作用域
	 * @param {*} node 节点
	 * @param {*} attrName 属性名
	 * @param {*} attrValue 属性值
	 */
	compilerMethods(scope,node,attrName,attrValue){
		// 获取类型
		let type = attrName.slice(1)
		let fn = scope[attrValue]
		node.addEventListener(type,fn.bind(scope))
	}
	/**
	 * 编译文本节点
	 * @param {} node 
	 */
	compilerTextNode(node) {
		let text = node.textContent.trim()
		if (text) {
			// 把text字符串转换成表达式
			let exp = this.parseTextExp(text)
			// 添加订阅者,计算表达式的值
			new Watcher(exp, this.context, (newValue) => {
				node.textContent = newValue
			})
			// 当表达式依赖的数据发生变化时
			// 1: 从新计算表达式的值
			// 2: node.textContent给最新的值
			// 即可完成Model -> View响应式
		}
	}
	/**
	 * 此函数完成了文本到表达式的转换
	 * 输入 111{{msg + '222'}}333
	 * 输出 '111'+ (msg + '222') + '333'
	 * 返回表达式
	 * @param {*} text 
	 */
	parseTextExp(text) {
		// 匹配差值表达式正则
		const regText = /\{\{(.+?)\}\}/g
		// 分割插值表达式前后内容
		let pices = text.split(regText)
		// 匹配差值表达式
		let matches = text.match(regText)
		// 表达式数组
		let tokens = []
		pices.forEach(item => {
			if (matches && matches.indexOf("{{" + item + "}}") > -1) {
				tokens.push("(" + item + ")")
			} else {
				tokens.push('`' + item + '`')
			}
		})
		return tokens.join('+')
	}
}