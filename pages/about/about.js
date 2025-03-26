// about.js
Page({
  data: {
    version: '1.0.0'
  },
  
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  }
}) 