import Dep from "./dep"

export default class Observer{
    constructor(data){
        this.data = data
        // 遍历对象完成所有数据的劫持
        this.walk(data)
    }
    /**
     * 遍历对象
     * @param {*} data 
     */
    walk(data){
        if(!data ||typeof data != 'object') return
        Object.keys(data).forEach(key=>{
            this.defineReactive(data,key,data[key])
        })
    }
    
    /**
     * 动态设置响应式数据
     * @param {*} data 
     * @param {*} key 
     * @param {*} value 
     */
    defineReactive(data,key,value){
        let dep = new Dep() // 拿到名单
        Object.defineProperty(data,key,{
            // 可遍历
            enumerable: true,
            // 不可在配置
            configurable:false,
            get:() =>{
                // 如果dep.target有东西就添加
                Dep.target && dep.addSub(Dep.target)
                // console.log("get");
                return value // 闭包形式存储的value
            },
            set:(newValue) =>{
                console.log("set");
                value = newValue
                // TODO 触发view页面视图更新变化
                dep.notify()
                
            }
        })
        this.walk(value) // 递归劫持子属性对象
    }
}