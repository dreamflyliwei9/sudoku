// solver.js
const sudokuSolver = require('../../utils/sudokuSolver');

Page({
  data: {
    sudokuData: [],
    solutionSteps: [],
    currentStepIndex: -1,
    showSolution: false,
    isSolved: false,
    isCompletedSudoku: false,
    validationResult: null
  },
  
  onLoad: function() {
    // 从全局数据中获取数独数据
    const app = getApp();
    if (app.globalData && app.globalData.sudokuData) {
      this.setData({
        sudokuData: this.deepCopy(app.globalData.sudokuData),
        isCompletedSudoku: app.globalData.isCompletedSudoku || false
      });
      
      // 根据是否为已完成的数独决定处理方式
      if (this.data.isCompletedSudoku) {
        this.validateCompletedSudoku();
      } else {
        this.analyzeSudoku();
      }
    } else {
      wx.showToast({
        title: '没有数独数据',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },
  
  // 深拷贝二维数组
  deepCopy(arr) {
    return arr.map(row => [...row]);
  },
  
  // 验证已完成的数独
  validateCompletedSudoku() {
    wx.showLoading({
      title: '正在验证数独...',
    });
    
    // 使用Promise包装验证过程，提高代码可读性
    new Promise((resolve) => {
      setTimeout(() => {
        // 使用数独验证算法
        const result = sudokuSolver.validateSudoku(this.data.sudokuData);
        resolve(result);
      }, 500);
    })
    .then((result) => {
      this.setData({
        validationResult: result,
        isSolved: true
      });
      wx.hideLoading();
    })
    .catch((error) => {
      wx.hideLoading();
      wx.showToast({
        title: '验证过程出错',
        icon: 'error'
      });
    });
  },
  
  // 分析未完成的数独并生成解题步骤
  analyzeSudoku() {
    wx.showLoading({
      title: '正在分析...',
    });
    
    // 使用Promise包装分析过程，提高代码可读性
    new Promise((resolve, reject) => {
      setTimeout(() => {
        // 使用数独求解算法
        const result = sudokuSolver.solveSudoku(this.data.sudokuData);
        if (result.solved) {
          resolve(result);
        } else {
          reject(new Error('无法求解'));
        }
      }, 500);
    })
    .then((result) => {
      this.setData({
        solutionSteps: result.steps,
        isSolved: true
      });
      wx.hideLoading();
    })
    .catch((error) => {
      wx.hideLoading();
      wx.showToast({
        title: '无法求解此数独',
        icon: 'error'
      });
    });
  },
  
  // 显示解题步骤
  showSolutionSteps() {
    this.setData({
      showSolution: true,
      currentStepIndex: 0
    });
  },
  
  // 下一步
  nextStep() {
    if (this.data.currentStepIndex < this.data.solutionSteps.length - 1) {
      this.setData({
        currentStepIndex: this.data.currentStepIndex + 1
      });
      
      // 当展示完所有步骤后，验证最终结果
      if (this.data.currentStepIndex === this.data.solutionSteps.length - 1) {
        // 获取最终的数独结果
        const finalBoard = this.data.solutionSteps[this.data.currentStepIndex].boardState;
        const result = sudokuSolver.validateSudoku(finalBoard);
        
        this.setData({
          validationResult: result
        });
      }
    }
  },
  
  // 上一步
  prevStep() {
    if (this.data.currentStepIndex > 0) {
      this.setData({
        currentStepIndex: this.data.currentStepIndex - 1
      });
      
      // 如果后退，清除验证结果
      if (this.data.validationResult && this.data.currentStepIndex < this.data.solutionSteps.length - 1) {
        this.setData({
          validationResult: null
        });
      }
    }
  },
  
  // 返回首页
  backToHome() {
    wx.navigateBack({
      delta: 2 // 返回到首页
    });
  },
  
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  }
}) 