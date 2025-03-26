// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 创建axios实例
const instance = axios.create({
  timeout: 30000,
  headers: {
    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// 云函数入口函数
exports.main = async (event, context) => {
  const { prompt } = event;
  
  try {
    const response = await instance({
      method: 'post',
      url: 'https://api.deepseek.com/v1/chat/completions',
      data: {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      }
    });
    
    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw {
        type: 'API_RESPONSE_ERROR',
        message: 'API返回格式错误'
      };
    }
    
    return {
      success: true,
      data: response.data.choices[0].message.content
    };
  } catch (error) {
    // 构建可序列化的错误对象
    const errorResponse = {
      success: false,
      error: {
        type: 'API_ERROR',
        message: '调用API失败'
      }
    };

    if (error.code === 'ECONNABORTED') {
      errorResponse.error = {
        type: 'TIMEOUT',
        message: '请求超时'
      };
    } else if (error.response) {
      errorResponse.error = {
        type: 'SERVER_ERROR',
        message: `服务器返回错误: ${error.response.status}`,
        status: error.response.status,
        statusText: error.response.statusText
      };
    } else if (error.type === 'API_RESPONSE_ERROR') {
      errorResponse.error = error;
    } else {
      errorResponse.error.message = error.message || '未知错误';
    }

    console.error('DeepSeek API调用失败:', errorResponse);
    return errorResponse;
  }
} 