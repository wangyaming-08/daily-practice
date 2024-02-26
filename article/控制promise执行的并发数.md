`promise 在异步操作中经常遇到，对多个并发异步过程的处理 Promise 自身有 Promise.all() Promise.allSettled() Promise.race()等，但都没有对并发数量进行控制。
实现了一个 Schedule 类，可以用来对并发数进行控制`

```
class Schedule{

    constructor(maxNum){
        this.list = [];
        this.maxNum = maxNum
        this.workingNum = 0
    }

    add(promiseCreator){
        this.list.push(promiseCreator)
    }

    start(){
        for (let index = 0; index < this.maxNum; index++) {
            this.doNext()
        }
    }

    doNext(){
        if(this.list.length && this.workingNum < this.maxNum){
            this.workingNum++;
            const promise = this.list.shift();
            promise().then(()=>{
                this.workingNum--;
                this.doNext();
            })

        }
    }
}

const timeout = time => new Promise((resolve)=>{
    setTimeout(resolve, time)
})

const schedule = new Schedule(2);

const addTask = (time, order)=>{
    schedule.add(()=>timeout(time).then(()=>{
        console.log(order);
    }))
}

addTask(1000, 1)
addTask(500, 2)
addTask(300, 3)
addTask(400, 4)

schedule.start()


```
