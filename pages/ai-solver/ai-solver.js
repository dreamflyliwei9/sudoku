Page({
  data: {
    sudokuData: [],
    originalData: [],
    isAnalyzing: true,
    analysis: null,
    error: null
  },

  onLoad(options) {
    const app = getApp();
    const sudokuData = app.globalData.sudokuData;
    
    this.setData({
      sudokuData: this.deepCopy(sudokuData),
      originalData: this.deepCopy(sudokuData)
    });
    
    this.startAnalysis();
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  deepCopy(arr) {
    return arr.map(row => [...row]);
  },

  // 开始AI分析
  async startAnalysis() {
    this.setData({ isAnalyzing: true, error: null });
    
    try {
      const result = await this.callDeepSeekAPI();
      this.setData({
        analysis: result,
        isAnalyzing: false
      });
    } catch (error) {
      console.error('AI分析失败:', error);
      
      let errorMessage = '分析失败: ';
      if (error.timeout) {
        errorMessage += '请求超时';
      } else if (error.status) {
        errorMessage += `服务器返回错误(${error.status}: ${error.statusText})`;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += '未知错误';
      }
      
      this.setData({
        error: errorMessage,
        isAnalyzing: false
      });
    }
  },

  // 调用DeepSeek API
  async callDeepSeekAPI() {
    const { sudokuData } = this.data;
    
    // 将数独转换为字符串格式
    const sudokuString = sudokuData.map(row => 
      row.map(cell => cell === 0 ? '.' : cell.toString()).join('')
    ).join('\n');

    const prompt = `作为一个数独专家，请简要分析这个数独题目并提供以下信息：
1. 难度评估（简单/中等/困难）
2. 推荐使用的主要解题策略（一句话）
3. 下一步最佳落子位置和原因（一句话）

数独题目：
${sudokuString}

请用中文回答，每项内容一句话，不要有多余解释。`;

    const response = await wx.cloud.callFunction({
      name: 'callDeepSeek',
      data: {
        prompt: prompt
      }
    });

    if (!response.result) {
      throw new Error('API返回结果为空');
    }

    if (!response.result.success) {
      throw new Error(response.result.error.message || '未知错误');
    }

    return this.parseAIResponse(response.result.data);
  },

  // 解析AI返回的结果
  parseAIResponse(response) {
    try {
      // 尝试从返回的文本中提取结构化信息
      const lines = response.split('\n');
      const result = {
        difficulty: '未知难度',
        strategy: '暂无推荐策略',
        nextStep: '暂无下一步提示'
      };

      for (const line of lines) {
        if (line.includes('难度')) {
          result.difficulty = line.split('：')[1]?.trim() || result.difficulty;
        } else if (line.includes('策略')) {
          result.strategy = line.split('：')[1]?.trim() || result.strategy;
        } else if (line.includes('下一步') || line.includes('位置')) {
          result.nextStep = line.split('：')[1]?.trim() || result.nextStep;
        }
      }

      return result;
    } catch (error) {
      console.error('解析AI响应失败:', error);
      throw new Error('解析AI响应失败: ' + error.message);
    }
  },

  // 获取下一步提示
  async getNextStep() {
    if (this.data.isAnalyzing) return;
    
    this.setData({ isAnalyzing: true, error: null });
    
    try {
      const result = await this.callDeepSeekAPI();
      this.setData({
        analysis: result,
        isAnalyzing: false
      });
    } catch (error) {
      console.error('获取提示失败:', error);
      this.setData({
        error: '获取提示失败: ' + (error.message || error),
        isAnalyzing: false
      });
    }
  },

  // 获取完整解答
  async getSolution() {
    if (this.data.isAnalyzing) return;
    
    this.setData({ isAnalyzing: true, error: null });
    
    try {
      const response = await wx.cloud.callFunction({
        name: 'callDeepSeek',
        data: {
          prompt: `请解答这个数独题目，并给出完整的解答过程。数独题目：${JSON.stringify(this.data.originalData)}`
        }
      });

      if (!response.result) {
        throw new Error('API返回结果为空');
      }

      if (!response.result.success) {
        throw new Error(response.result.error.message || '未知错误');
      }

      // 更新显示
      const solution = this.parseFullSolution(response.result.data);
      if (solution) {
        this.setData({
          sudokuData: solution,
          isAnalyzing: false
        });
      } else {
        throw new Error('无法解析完整解答');
      }
    } catch (error) {
      console.error('获取解答失败:', error);
      this.setData({
        error: '获取解答失败: ' + (error.message || '未知错误'),
        isAnalyzing: false
      });
    }
  },

  // 解析完整解答
  parseFullSolution(response) {
    try {
      // 尝试从文本中提取数独解答
      const lines = response.split('\n');
      const solution = Array(9).fill().map(() => Array(9).fill(0));
      let foundGrid = false;
      
      for (const line of lines) {
        // 寻找包含数字的行
        const numbers = line.match(/[1-9]/g);
        if (numbers && numbers.length === 9) {
          const rowIndex = solution.findIndex(row => row.every(cell => cell === 0));
          if (rowIndex !== -1) {
            solution[rowIndex] = numbers.map(Number);
            foundGrid = true;
          }
        }
      }

      return foundGrid ? solution : null;
    } catch (error) {
      console.error('解析完整解答失败:', error);
      throw new Error('解析完整解答失败: ' + error.message);
    }
  }
}); 