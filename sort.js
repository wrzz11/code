function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = [];
  const right = [];
  const equal = [];

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else if (arr[i] > pivot) {
      right.push(arr[i]);
    } else {
      equal.push(arr[i]);
    }
  }

  return [...quickSort(left), ...equal, ...quickSort(right)];
}

// 测试数组
const numbers = [50, 30, 35, 20];
console.log('原始数组:', numbers);

// 排序数组
const sortedNumbers = quickSort(numbers);
console.log('排序后数组:', sortedNumbers);