// manual.js
Page({
  data: {
    sudokuData: Array(9).fill().map(() => Array(9).fill(0)),
    selectedRow: -1,
    selectedCol: -1,
    showKeypad: false
  },
  
  // 选择单元格
  selectCell(e) {
    const { row, col } = e.currentTarget.dataset;
    this.setData({
      selectedRow: row,
      selectedCol: col,
      showKeypad: true
    });
  },
  
  // 输入数字
  inputNumber(e) {
    const { number } = e.currentTarget.dataset;
    const { selectedRow, selectedCol, sudokuData } = this.data;
    
    if (selectedRow >= 0 && selectedCol >= 0) {
      const newSudokuData = this.deepCopy(sudokuData);
      
      if (number === 'delete') {
        newSudokuData[selectedRow][selectedCol] = 0;
      } else {
        newSudokuData[selectedRow][selectedCol] = number;
      }
      
      this.setData({
        sudokuData: newSudokuData,
        showKeypad: false,
        selectedRow: -1,
        selectedCol: -1
      });
    }
  },
  
  // 关闭键盘
  closeKeypad() {
    this.setData({
      showKeypad: false,
      selectedRow: -1,
      selectedCol: -1
    });
  },
  
  // 阻止事件冒泡
  stopPropagation() {
    return;
  },
  
  // 处理键盘输入
  handleKeyInput(e) {
    const value = parseInt(e.detail.value);
    if (!isNaN(value) && value >= 1 && value <= 9) {
      this.inputNumber({
        currentTarget: {
          dataset: {
            number: value
          }
        }
      });
    } else if (e.detail.value === '') {
      this.inputNumber({
        currentTarget: {
          dataset: {
            number: 'delete'
          }
        }
      });
    }
  },
  
  // 深拷贝二维数组
  deepCopy(arr) {
    return arr.map(row => [...row]);
  },
  
  // 重置数独
  resetSudoku() {
    this.setData({
      sudokuData: Array(9).fill().map(() => Array(9).fill(0)),
      selectedRow: -1,
      selectedCol: -1,
      showKeypad: false
    });
  },
  
  // 开始分析
  startAnalysis() {
    // 检查是否有至少一个数字
    let hasNumber = false;
    for (let i = 0; i < 9 && !hasNumber; i++) {
      for (let j = 0; j < 9 && !hasNumber; j++) {
        if (this.data.sudokuData[i][j] !== 0) {
          hasNumber = true;
        }
      }
    }
    
    if (!hasNumber) {
      wx.showToast({
        title: '请至少输入一个数字',
        icon: 'none'
      });
      return;
    }
    
    // 将数据保存到全局
    const app = getApp();
    app.globalData.sudokuData = this.deepCopy(this.data.sudokuData);
    app.globalData.isCompletedSudoku = false; // 标记为未完成状态，需要分析
    
    // 跳转到分析页面
    wx.navigateTo({
      url: '/pages/solver/solver'
    });
  }
}) 