// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-6gq1dimo0248723d',
        traceUser: true,
      });
    }
    // 初始化全局数据
    this.globalData = {
      sudokuData: null,
      isCompletedSudoku: false
    };
  },
  
  globalData: {
    sudokuData: null,
    isCompletedSudoku: false
  }
})
