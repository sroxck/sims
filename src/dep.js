export default class Dep{
    constructor(){
        // 存放所有Watcher
        this.subs = {}
    }
    addSub(target){
        this.subs[target.uid] = target
    }
    notify(){
        for(let uid in this.subs){
            console.log(this.subs,this.subs[uid]);
            this.subs[uid].update()
        }
    }
}