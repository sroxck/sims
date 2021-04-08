import Dep from "./dep"

var $uid = 0
export default class Watcher{
    constructor(exp,scope,cb){
        // 转存
        this.exp = exp
        this.scope = scope
        this.cb = cb
        this.uid = $uid++
        this.update()
    }
    /**
     * 计算表达式的值并返回
     */
    get(){
        Dep.target = this
        let newValue = Watcher.computeExp(this.exp,this.scope)
        return newValue
    }
    /**
     * 完成回调函数的调用
     */
    update(){
        let newValue = this.get();
        this.cb && this.cb(newValue)
    }
    /**
     *计算表达式的值
     */
    static computeExp(exp,scope){
        let fn = new Function('scope', "with(scope){return " + exp + "}")
        return fn(scope)
    }
}
