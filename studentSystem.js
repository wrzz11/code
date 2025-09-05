const readline = require('readline');

// 学生信息管理系统
class StudentManager {
  constructor() {
    // 初始化学生数组
    this.students = [];
  }

  // 添加学生信息
  addStudent(name, studentId, age, major) {
    // 检查学号是否已存在
    const existingStudent = this.students.find(student => student.studentId === studentId);
    if (existingStudent) {
      return { success: false, message: `学号 ${studentId} 已存在！` };
    }

    // 创建新学生对象
    const newStudent = {
      name,
      studentId,
      age,
      major
    };

    // 添加到数组
    this.students.push(newStudent);
    return { success: true, message: `学生 ${name} 添加成功！`, student: newStudent };
  }

  // 根据学号查询学生
  getStudentById(studentId) {
    const student = this.students.find(student => student.studentId === studentId);
    if (!student) {
      return { success: false, message: `学号 ${studentId} 不存在！` };
    }
    return { success: true, student };
  }

  // 修改学生信息（根据学号修改年龄和专业）
  updateStudent(studentId, newAge, newMajor) {
    const studentIndex = this.students.findIndex(student => student.studentId === studentId);
    if (studentIndex === -1) {
      return { success: false, message: `学号 ${studentId} 不存在！` };
    }

    // 更新学生信息
    this.students[studentIndex].age = newAge;
    this.students[studentIndex].major = newMajor;
    
    return { 
      success: true, 
      message: `学号 ${studentId} 的学生信息更新成功！`, 
      student: this.students[studentIndex] 
    };
  }

  // 删除学生信息（根据学号删除）
  deleteStudent(studentId) {
    const studentIndex = this.students.findIndex(student => student.studentId === studentId);
    if (studentIndex === -1) {
      return { success: false, message: `学号 ${studentId} 不存在！` };
    }

    // 删除学生
    const deletedStudent = this.students.splice(studentIndex, 1)[0];
    return { 
      success: true, 
      message: `学号 ${studentId} 的学生 ${deletedStudent.name} 删除成功！`, 
      student: deletedStudent 
    };
  }

  // 获取所有学生
  getAllStudents() {
    return { success: true, students: this.students };
  }
}

// 创建学生管理器实例
const studentManager = new StudentManager();

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 显示菜单
function showMenu() {
  console.log('\n===== 学生信息管理系统 =====');
  console.log('1. 添加学生');
  console.log('2. 查询学生');
  console.log('3. 修改学生信息');
  console.log('4. 删除学生');
  console.log('5. 显示所有学生');
  console.log('0. 退出系统');
  console.log('=========================');
}

// 添加学生
function addStudent() {
  rl.question('请输入学生姓名: ', (name) => {
    rl.question('请输入学号: ', (studentId) => {
      rl.question('请输入年龄: ', (age) => {
        rl.question('请输入专业: ', (major) => {
          const result = studentManager.addStudent(name, studentId, parseInt(age), major);
          console.log(result.message);
          if (result.success) {
            console.log('添加的学生信息:', result.student);
          }
          mainMenu();
        });
      });
    });
  });
}

// 查询学生
function getStudent() {
  rl.question('请输入要查询的学号: ', (studentId) => {
    const result = studentManager.getStudentById(studentId);
    if (result.success) {
      console.log('查询到的学生信息:', result.student);
    } else {
      console.log(result.message);
    }
    mainMenu();
  });
}

// 修改学生信息
function updateStudent() {
  rl.question('请输入要修改的学生学号: ', (studentId) => {
    const student = studentManager.getStudentById(studentId);
    if (!student.success) {
      console.log(student.message);
      return mainMenu();
    }
    
    console.log('当前学生信息:', student.student);
    rl.question('请输入新的年龄: ', (age) => {
      rl.question('请输入新的专业: ', (major) => {
        const result = studentManager.updateStudent(studentId, parseInt(age), major);
        console.log(result.message);
        if (result.success) {
          console.log('更新后的学生信息:', result.student);
        }
        mainMenu();
      });
    });
  });
}

// 删除学生
function deleteStudent() {
  rl.question('请输入要删除的学生学号: ', (studentId) => {
    const result = studentManager.deleteStudent(studentId);
    console.log(result.message);
    mainMenu();
  });
}

// 显示所有学生
function showAllStudents() {
  const result = studentManager.getAllStudents();
  if (result.students.length === 0) {
    console.log('暂无学生信息');
  } else {
    console.log('所有学生信息:');
    result.students.forEach((student, index) => {
      console.log(`${index + 1}. 姓名: ${student.name}, 学号: ${student.studentId}, 年龄: ${student.age}, 专业: ${student.major}`);
    });
  }
  mainMenu();
}

// 主菜单
function mainMenu() {
  showMenu();
  rl.question('请选择操作 (0-5): ', (choice) => {
    switch (choice) {
      case '1':
        addStudent();
        break;
      case '2':
        getStudent();
        break;
      case '3':
        updateStudent();
        break;
      case '4':
        deleteStudent();
        break;
      case '5':
        showAllStudents();
        break;
      case '0':
        console.log('感谢使用学生信息管理系统，再见！');
        rl.close();
        break;
      default:
        console.log('无效的选择，请重新输入！');
        mainMenu();
        break;
    }
  });
}

// 启动程序
console.log('欢迎使用学生信息管理系统！');
mainMenu();