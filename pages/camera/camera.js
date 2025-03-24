// camera.js
const imageProcessor = require('../../utils/imageProcessor');

Page({
  data: {
    sudokuImage: '',
    processingImage: false,
    cameraError: false
  },

  // 拍照
  takePhoto() {
    const ctx = wx.createCameraContext();
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          sudokuImage: res.tempImagePath,
          processingImage: true
        });
        this.processSudokuImage(res.tempImagePath);
      },
      fail: (err) => {
        wx.showToast({
          title: '拍照失败',
          icon: 'error'
        });
      }
    });
  },

  // 从相册选择
  chooseFromAlbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          sudokuImage: tempFilePath,
          processingImage: true
        });
        this.processSudokuImage(tempFilePath);
      },
      fail: (err) => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        });
      }
    });
  },

  // 处理图片并识别数独
  processSudokuImage(imagePath) {
    wx.showLoading({
      title: '正在识别数独...',
    });
    
    imageProcessor.recognizeSudokuFromImage(imagePath)
      .then(result => {
        // 将识别结果存到全局数据
        const app = getApp();
        app.globalData.sudokuData = result.sudokuData;
        app.globalData.isCompletedSudoku = result.isCompleted;
        
        this.setData({
          processingImage: false
        });
        
        wx.hideLoading();
        
        // 跳转到解题页面
        wx.navigateTo({
          url: '/pages/solver/solver'
        });
      })
      .catch(error => {
        wx.hideLoading();
        wx.showToast({
          title: '识别失败，请重试',
          icon: 'error'
        });
        
        this.setData({
          processingImage: false
        });
      });
  },
  
  // 返回主页
  backToHome() {
    wx.navigateBack();
  },

  error(e) {
    console.error(e.detail)
    this.setData({
      cameraError: true
    })
    wx.showToast({
      title: '相机不可用',
      icon: 'none',
      duration: 2000
    })
  }
}) 