document.addEventListener('DOMContentLoaded', function() {
  const optionsButton = document.getElementById('openOptions');
  if (optionsButton) {
    optionsButton.addEventListener('click', function() {
      console.log('打开选项按钮被点击');
      if (chrome.runtime.openOptionsPage) {
        console.log('使用 chrome.runtime.openOptionsPage');
        chrome.runtime.openOptionsPage();
      } else {
        console.log('使用 window.open');
        window.open(chrome.runtime.getURL('options.html'));
      }
    });
    console.log('按钮事件监听器已添加');
  } else {
    console.error('找不到 openOptions 按钮');
  }
});