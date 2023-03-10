const arr = [
  {a: 1, b: 2},
  {b: 2, a: 1},
  {a: 1, b: 2, c: {a: 1, b: 2}},
  {b: 2, a: 1, c: {b: 2, a: 1}},
]
// 对象数组去重
// 对象均为 Plain Object
// 只要对象的所有属性值相同，则表示相同对象

const isObject = (val) => typeof val === 'object' && val !== null
// 判断什么是重复，定义重复数据
function equals (val1, val2) {
 if (isObject(val1) && isObject(val2)) {
   const keys1 = Object.keys(val1)
   const keys2 = Object.keys(val2)
   if (keys1.length !== keys2.length) {
     return false
   }
   for (const k of keys1) {
     if (!keys2.includes(k)) {
       return false
     }
     if (!equals(val1[k], val2[k])) {
        return false
     }
   }
   return true
 } else {
   return val1 === val2
 }
}
const newArr = [...arr];
for (let i = 0; i < newArr.length; i++) {

  for (let j = i + 1; j < newArr.length; j++) {
    // 去掉 i + 1 开始后续值
    if (equals(newArr[i], newArr[j])) {
      newArr.splice(j, 1)
      j-- 
    }

  }

}
console.log(newArr)