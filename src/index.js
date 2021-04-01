const { default: Compiler } = require("./compiler");
const { default: Observer } = require("./observer");

class Sims{
    constructor(options){
        // 获取元素dom对象
        this.$el = document.querySelector(options.el)
        // 转存数据
        this.$data = options.data || {}
        // 数据和函数的代理
        this._proxyData(this.$data)
        this._proxyMethods(options.methods)

        // 数据劫持
        new Observer(this.$data)
        // 模板编译
        new Compiler(this)

    }
    /**
     * 数据的代理
     * 这个函数是为了能直接通过vm.msg拿到数据而不用vm.$data, 就是把$data里面的数据都劫持到vm里面
     * @param {*} data 
     */
    _proxyData(data){
        Object.keys(data).forEach(key=>{
            // 从哪里拿数据 this,
            Object.defineProperty(this,key,{
                set(newValue){
                    data[key] = newValue
                },
                get(){
                    // 从vm里面点一个属性(key)的时候,返回的是$data.属性(key)
                    return data[key]
                }
            })
        })
    }/**
     * 函数的代理
     * @param {*} methods 
     */
    _proxyMethods(methods){
        if (methods && typeof methods == 'object'){
            Object.keys(methods).forEach(key=>{
                this[key] = methods[key]
            })
        }
    }
}
window.Sims = Sims