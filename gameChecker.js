#!/usr/bin/env node

/**
 * 遊戲檢查和修復工具
 * 檢查所有遊戲的幫助功能、主題支持和語言支持
 */

const fs = require('fs');
const path = require('path');

// 遊戲檢查結果
const checkResults = {
  gamesWithHelp: [],
  gamesMissingHelp: [],
  gamesWithTheme: [],
  gamesMissingTheme: [],
  gamesWithLanguage: [],
  gamesMissingLanguage: []
};

// 需要檢查的遊戲文件模式
const gameFilePattern = /\.html$/;
const excludeFiles = ['index.html', 'profile.html', 'dashboard.html', 'settings.html', 'offline.html'];

// 檢查幫助功能的模式
const helpPatterns = {
  helpButton: /id=["']help(Button|Btn)["']/i,
  helpModal: /id=["']help(Modal|modal)["']/i,
  showHelp: /showHelp\s*\(/,
  closeHelp: /closeHelp\s*\(/,
  helpEventListener: /addEventListener\s*\(\s*["']click["']\s*,.*help/i
};

// 檢查主題功能的模式
const themePatterns = {
  themeToggle: /id=["']theme-toggle["']/i,
  dataTheme: /data-theme/i,
  themeManager: /themeManager/i
};

// 檢查語言功能的模式
const languagePatterns = {
  langToggle: /id=["']language-toggle["']/i,
  dataTranslate: /data-translate/i,
  languageManager: /languageManager/i
};

function checkGameFile(filePath) {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const result = {
    file: fileName,
    help: {
      hasButton: helpPatterns.helpButton.test(content),
      hasModal: helpPatterns.helpModal.test(content),
      hasShowFunction: helpPatterns.showHelp.test(content),
      hasCloseFunction: helpPatterns.closeHelp.test(content),
      hasEventListener: helpPatterns.helpEventListener.test(content)
    },
    theme: {
      hasToggle: themePatterns.themeToggle.test(content),
      hasDataTheme: themePatterns.dataTheme.test(content),
      hasManager: themePatterns.themeManager.test(content)
    },
    language: {
      hasToggle: languagePatterns.langToggle.test(content),
      hasDataTranslate: languagePatterns.dataTranslate.test(content),
      hasManager: languagePatterns.languageManager.test(content)
    }
  };
  
  // 評估幫助功能完整性
  const helpScore = Object.values(result.help).filter(Boolean).length;
  result.help.isComplete = helpScore >= 3; // 至少需要按鈕、模態框和事件監聽器
  
  // 評估主題功能
  result.theme.isSupported = result.theme.hasToggle || result.theme.hasDataTheme;
  
  // 評估語言功能
  result.language.isSupported = result.language.hasToggle || result.language.hasDataTranslate;
  
  return result;
}

function generateReport() {
  const gameDir = './';
  const files = fs.readdirSync(gameDir)
    .filter(file => gameFilePattern.test(file) && !excludeFiles.includes(file));
  
  const results = files.map(file => checkGameFile(path.join(gameDir, file)));
  
  // 分類結果
  results.forEach(result => {
    if (result.help.isComplete) {
      checkResults.gamesWithHelp.push(result.file);
    } else {
      checkResults.gamesMissingHelp.push(result.file);
    }
    
    if (result.theme.isSupported) {
      checkResults.gamesWithTheme.push(result.file);
    } else {
      checkResults.gamesMissingTheme.push(result.file);
    }
    
    if (result.language.isSupported) {
      checkResults.gamesWithLanguage.push(result.file);
    } else {
      checkResults.gamesMissingLanguage.push(result.file);
    }
  });
  
  // 生成報告
  console.log('遊戲功能檢查報告');
  console.log('================');
  console.log();
  
  console.log('幫助功能狀態:');
  console.log(`✅ 完整的幫助功能 (${checkResults.gamesWithHelp.length}個):`);
  checkResults.gamesWithHelp.forEach(game => console.log(`   - ${game}`));
  console.log(`❌ 缺少幫助功能 (${checkResults.gamesMissingHelp.length}個):`);
  checkResults.gamesMissingHelp.forEach(game => console.log(`   - ${game}`));
  console.log();
  
  console.log('主題功能狀態:');
  console.log(`✅ 支持主題切換 (${checkResults.gamesWithTheme.length}個):`);
  checkResults.gamesWithTheme.forEach(game => console.log(`   - ${game}`));
  console.log(`❌ 缺少主題支持 (${checkResults.gamesMissingTheme.length}個):`);
  checkResults.gamesMissingTheme.forEach(game => console.log(`   - ${game}`));
  console.log();
  
  console.log('語言功能狀態:');
  console.log(`✅ 支持語言切換 (${checkResults.gamesWithLanguage.length}個):`);
  checkResults.gamesWithLanguage.forEach(game => console.log(`   - ${game}`));
  console.log(`❌ 缺少語言支持 (${checkResults.gamesMissingLanguage.length}個):`);
  checkResults.gamesMissingLanguage.forEach(game => console.log(`   - ${game}`));
  console.log();
  
  // 詳細結果
  console.log('詳細檢查結果:');
  console.log('============');
  results.forEach(result => {
    console.log(`\n${result.file}:`);
    console.log(`  幫助功能: 按鈕=${result.help.hasButton} 模態框=${result.help.hasModal} 顯示函數=${result.help.hasShowFunction} 關閉函數=${result.help.hasCloseFunction} 事件監聽=${result.help.hasEventListener}`);
    console.log(`  主題功能: 切換按鈕=${result.theme.hasToggle} data-theme=${result.theme.hasDataTheme} 管理器=${result.theme.hasManager}`);
    console.log(`  語言功能: 切換按鈕=${result.language.hasToggle} data-translate=${result.language.hasDataTranslate} 管理器=${result.language.hasManager}`);
  });
  
  return results;
}

if (require.main === module) {
  generateReport();
}

module.exports = { checkGameFile, generateReport };
