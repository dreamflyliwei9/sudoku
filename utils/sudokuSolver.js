/**
 * 数独求解器
 * 包含数独的求解算法和解题步骤生成
 */

// 检查在指定位置放置数字是否有效
function isValid(board, row, col, num) {
  // 检查行
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) {
      return false;
    }
  }

  // 检查列
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) {
      return false;
    }
  }

  // 检查3x3网格
  let startRow = Math.floor(row / 3) * 3;
  let startCol = Math.floor(col / 3) * 3;
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
}

// 找到所有可能的候选数字
function findCandidates(board, row, col) {
  const candidates = [];
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      candidates.push(num);
    }
  }
  return candidates;
}

// 查找所有空白格子及其候选数字
function findEmptyCells(board) {
  const emptyCells = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) {
        const candidates = findCandidates(board, i, j);
        emptyCells.push({
          row: i,
          col: j,
          candidates: candidates
        });
      }
    }
  }
  return emptyCells;
}

// 深拷贝二维数组
function deepCopyBoard(board) {
  return board.map(row => [...row]);
}

// 使用回溯法求解数独
function solveSudoku(board) {
  const solution = deepCopyBoard(board);
  const steps = [];
  
  if (solveWithSteps(solution, steps)) {
    return {
      solved: true,
      solution: solution,
      steps: steps
    };
  } else {
    return {
      solved: false,
      solution: null,
      steps: []
    };
  }
}

// 带步骤的求解过程
function solveWithSteps(board, steps) {
  // 查找所有空白格及其候选数字
  const emptyCells = findEmptyCells(board);
  
  // 如果没有空白格，说明已解决
  if (emptyCells.length === 0) {
    return true;
  }
  
  // 策略1: 唯一候选数
  for (const cell of emptyCells) {
    if (cell.candidates.length === 1) {
      const num = cell.candidates[0];
      board[cell.row][cell.col] = num;
      
      steps.push({
        description: `在第${cell.row + 1}行第${cell.col + 1}列，可以确定是${num}`,
        reason: '因为这个位置只有一个候选数字',
        position: { row: cell.row, col: cell.col },
        value: num,
        technique: 'SINGLE_CANDIDATE',
        boardState: deepCopyBoard(board)
      });
      
      if (solveWithSteps(board, steps)) {
        return true;
      }
      
      // 如果失败，回溯
      board[cell.row][cell.col] = 0;
      steps.pop();
      return false;
    }
  }
  
  // 策略2: 唯一位置
  // 检查每个数字在行、列或九宫格中是否只有一个可能位置
  for (let num = 1; num <= 9; num++) {
    // 检查行
    for (let row = 0; row < 9; row++) {
      let validPositions = [];
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0 && isValid(board, row, col, num)) {
          validPositions.push({ row, col });
        }
      }
      
      if (validPositions.length === 1) {
        const { row: r, col: c } = validPositions[0];
        board[r][c] = num;
        
        steps.push({
          description: `在第${r + 1}行第${c + 1}列，可以确定是${num}`,
          reason: `因为在第${r + 1}行中，${num}只能放在第${c + 1}列，其他位置都已被排除`,
          position: { row: r, col: c },
          value: num,
          technique: 'HIDDEN_SINGLE_ROW',
          boardState: deepCopyBoard(board)
        });
        
        if (solveWithSteps(board, steps)) {
          return true;
        }
        
        // 如果失败，回溯
        board[r][c] = 0;
        steps.pop();
        return false;
      }
    }
    
    // 检查列
    for (let col = 0; col < 9; col++) {
      let validPositions = [];
      for (let row = 0; row < 9; row++) {
        if (board[row][col] === 0 && isValid(board, row, col, num)) {
          validPositions.push({ row, col });
        }
      }
      
      if (validPositions.length === 1) {
        const { row: r, col: c } = validPositions[0];
        board[r][c] = num;
        
        steps.push({
          description: `在第${r + 1}行第${c + 1}列，可以确定是${num}`,
          reason: `因为在第${c + 1}列中，${num}只能放在第${r + 1}行，其他位置都已被排除`,
          position: { row: r, col: c },
          value: num,
          technique: 'HIDDEN_SINGLE_COLUMN',
          boardState: deepCopyBoard(board)
        });
        
        if (solveWithSteps(board, steps)) {
          return true;
        }
        
        // 如果失败，回溯
        board[r][c] = 0;
        steps.pop();
        return false;
      }
    }
    
    // 检查九宫格
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        let validPositions = [];
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const row = boxRow * 3 + i;
            const col = boxCol * 3 + j;
            if (board[row][col] === 0 && isValid(board, row, col, num)) {
              validPositions.push({ row, col });
            }
          }
        }
        
        if (validPositions.length === 1) {
          const { row: r, col: c } = validPositions[0];
          board[r][c] = num;
          
          steps.push({
            description: `在第${r + 1}行第${c + 1}列，可以确定是${num}`,
            reason: `因为在第${Math.floor(r / 3) + 1}行第${Math.floor(c / 3) + 1}列的九宫格中，${num}只能放在这个位置，其他位置都已被排除`,
            position: { row: r, col: c },
            value: num,
            technique: 'HIDDEN_SINGLE_BOX',
            boardState: deepCopyBoard(board)
          });
          
          if (solveWithSteps(board, steps)) {
            return true;
          }
          
          // 如果失败，回溯
          board[r][c] = 0;
          steps.pop();
          return false;
        }
      }
    }
  }
  
  // 策略3: 选择候选数最少的格子进行尝试
  emptyCells.sort((a, b) => a.candidates.length - b.candidates.length);
  const cell = emptyCells[0];
  
  for (const num of cell.candidates) {
    board[cell.row][cell.col] = num;
    
    steps.push({
      description: `在第${cell.row + 1}行第${cell.col + 1}列，尝试填入${num}`,
      reason: `这个位置有${cell.candidates.length}个候选数字：${cell.candidates.join(', ')}。我们先尝试${num}`,
      position: { row: cell.row, col: cell.col },
      value: num,
      technique: 'TRIAL_AND_ERROR',
      boardState: deepCopyBoard(board)
    });
    
    if (solveWithSteps(board, steps)) {
      return true;
    }
    
    // 如果失败，回溯
    board[cell.row][cell.col] = 0;
    steps.pop();
  }
  
  return false;
}

// 检查数独是否有效
function validateSudoku(board) {
  // 检查行
  for (let row = 0; row < 9; row++) {
    const seen = new Set();
    for (let col = 0; col < 9; col++) {
      const num = board[row][col];
      if (num !== 0) {
        if (seen.has(num)) {
          return {
            valid: false,
            message: `第${row + 1}行有重复数字${num}`
          };
        }
        seen.add(num);
      }
    }
  }
  
  // 检查列
  for (let col = 0; col < 9; col++) {
    const seen = new Set();
    for (let row = 0; row < 9; row++) {
      const num = board[row][col];
      if (num !== 0) {
        if (seen.has(num)) {
          return {
            valid: false,
            message: `第${col + 1}列有重复数字${num}`
          };
        }
        seen.add(num);
      }
    }
  }
  
  // 检查九宫格
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Set();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const row = boxRow * 3 + i;
          const col = boxCol * 3 + j;
          const num = board[row][col];
          if (num !== 0) {
            if (seen.has(num)) {
              return {
                valid: false,
                message: `第${boxRow + 1}行第${boxCol + 1}列的九宫格中有重复数字${num}`
              };
            }
            seen.add(num);
          }
        }
      }
    }
  }
  
  return {
    valid: true,
    message: '结果正确'
  };
}

module.exports = {
  solveSudoku,
  validateSudoku,
  isValid,
  findCandidates,
  deepCopyBoard
}; 