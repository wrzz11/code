// 定义一个数组
const numbers = [5, 12, 8, 15, 3, 20];

// 创建一个函数来筛选大于10的数字
function filterNumbers(arr) {
  return arr.filter(num => num > 10);
}

// 调用函数并获取结果
const filteredNumbers = filterNumbers(numbers);

// 输出结果
console.log('原始数组:', numbers);
console.log('大于10的数字:', filteredNumbers);