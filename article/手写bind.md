## bind
bind()  函数会创建一个新的绑定函数（bound function，BF）。绑定函数是一个 exotic function object（怪异函数对象，ECMAScript 2015 中的术语），它包装了原函数对象。调用绑定函数通常会导致执行包装函数。
绑定函数具有以下内部属性：

* [[BoundTargetFunction]]  - 包装的函数对象
* [[BoundThis]]  - 在调用包装函数时始终作为 this 值传递的值。
* [[BoundArguments]]  - 列表，在对包装函数做任何调用都会优先用列表元素填充参数列表。
* [[Call]]  - 执行与此对象关联的代码。通过函数调用表达式调用。内部方法的参数是一个this值和一个包含通过调用表达式传递给函数的参数的列表。
当调用绑定函数时，它调用  [[BoundTargetFunction]]  上的内部方法  [[Call]] ，就像这样 Call(boundThis, args) 。其中，boundThis 是  [[BoundThis]] ，args 是  [[BoundArguments]]  加上通过函数调用传入的参数列表。

绑定函数也可以使用 new 运算符构造，它会表现为目标函数已经被构建完毕了似的。提供的 this 值会被忽略，但前置参数仍会提供给模拟函数。
以上是MDN对bind函数的描述认真理解会很有帮助

```
function fn (a, b) {
  console.log(this, a, b)
}
var newFn = fn.bind({})
newFn(2,3)
// 输出 {}, 2, 3
```
## 第一版本bind

```
Function.prototype.myBind = function() {
    let outContext = arguments[0] // 取上下文
    let outArgs = Array.from(arguments).slice(1) // 取外部入参
    const outThis = this // 存外部this
    let cb = function() {
        const inArgs = Array.from(arguments)// 取内部入参
        return outThis.apply(outContext, outArgs.concat(inArgs)) // 改变指向，合并函数入参
    }
    return cb // 返回创建函数
}

试一下

var obj = {name:1,age:2}
var name = 'Leo', age = 18
function Fn(height, Gender) {
    console.log('name：', this.name, 'age:', this.age,'height:',height, 'Gender:',Gender)
}

Fn() // name： Leo age: 18 height: undefined Gender: undefined
var fn1 = Fn.myBind(obj, '80cm')
fn1() // name： 1 age: 2 height: 80cm Gender: undefined
fn1('男') // 1 age: 2 height: 80cm Gender: 男
```
第一版本的完成了其基本实现bind的模拟 但是可以从描述的最后一句话中得知："绑定函数也可以使用 new 运算符构造，它会表现为目标函数已经被构建完毕了似的。提供的 this 值会被忽略，但前置参数仍会提供给模拟函数
## 第二版本bind
```
Function.prototype.myBind_2 = function() {
    let outContext = arguments[0] // 取上下文
    let outArgs = Array.from(arguments).slice(1) // 取外部入参
    const outThis = this // 存外部this
    let cb = function() {
        const isNew = typeof new.target !== 'undefined' // 判断函数是否被new过
        const inArgs = Array.from(arguments)// 取内部入参
        return outThis.apply(isNew ? this : outContext, outArgs.concat(inArgs)) // 改变指向，合并函数入参
    }
    return cb // 返回创建函数
}

试一下

var obj = {name:1,age:2}
var name = 'Leo', age = 18
function Fn(height, Gender) {
    console.log('name：', this.name, 'age:', this.age,'height:',height, 'Gender:',Gender)
}


var fn1 = Fn.myBind_2(obj, '80cm')
var obj1 = new fn1() // name： undefined age: undefined height: 80cm Gender: undefined

var fn2 = Fn.bind(obj, '80cm')
var obj2 = new fn2() // name： undefined age: undefined height: 80cm Gender: undefined
```
以上可以看到myBind_2和原生bind表现一致

有点疑问，为什么用new.target来做new判断, 其实早在es5使用了instanceof来做判断但是这个会出现一些意外问题，准确的说是即使不是new出来的函数，用instanceof也可以找到。所以es6提供了new.target这个api用于判断是否该函数通过new调用。

### 下方这两个对比例子大家感受一下就知道我说什么了
```
function Person(name) {
    if(this instanceof Person) {
        this.name = name;
        console.log('success...')
    } else {
        throw new Error('未通过new执行construct函数...');
    }
}

let person1 = new Person('test001');  // success...
let person2 = Person.call(person1,'test002'); // success...
```

```
function Person(name) {
  if(typeof new.target !== 'undefined') {
      this.name = name;
      console.log('success...')
  } else {
      throw new Error('未通过new执行construct函数...');
  }
}

let person1 = new Person('test001');
let person2 = Person.call(person1,'test002');

console.log(person1); //success...
console.log(person2); // 未通过new执行construct函数...
```
但是提到new那么关于原型链的知识点就浮出于脑海，那么也就产生了一个新问题，构造函数的原型继承问题，其实要解决这个问题也不难，无非就是将其继承即可
##  第三版本bind（最终版）
```
Function.prototype.myBind_3 = function() {
    let outContext = arguments[0] // 取上下文
    let outArgs = Array.from(arguments).slice(1) // 取外部入参
    const outThis = this // 存外部this
    let cb = function() {
        const isNew = typeof new.target !== 'undefined' // 判断函数是否被new过
        const inArgs = Array.from(arguments)// 取内部入参
        return outThis.apply(isNew ? this : outContext, outArgs.concat(inArgs)) // 改变指向，合并函数入参
    }
    cb.prototype = outThis.prototype // 继承构造函数原型
    return cb // 返回创建函数
}

试一下

var obj = {name:1,age:2}
var name = 'Leo', age = 18
function Fn(height, Gender) {
    console.log('name：', this.name, 'age:', this.age,'height:',height, 'Gender:',Gender)
}
Fn.prototype.say = function() {
    console.log('Fn.prototype.say')
}

var fn1 = Fn.myBind_3(obj, '80cm')
var obj1 = new fn1('male') // name： undefined age: undefined height: 80cm Gender: male
obj1.say() // Fn.prototype.say

var fn1 = Fn.bind(obj, '80cm')
var obj1 = new fn1('male') // name： undefined age: undefined height: 80cm Gender: male
obj1.say() // Fn.prototype.say

```