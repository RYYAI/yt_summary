// 保存选项到 chrome.storage
function saveOptions() {
  const apiUrl = document.getElementById('apiUrl').value;
  const apiKey = document.getElementById('apiKey').value;
  const model = document.getElementById('model').value;
  const temperature = parseFloat(document.getElementById('temperature').value);
  
  // 检查必要字段是否已填写
  if (!apiUrl || !apiKey || !model) {
    const status = document.getElementById('status');
    status.textContent = '请填写所有必要的配置信息';
    status.style.color = 'red';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
    return;
  }
  
  chrome.storage.sync.set({
    apiUrl: apiUrl,
    apiKey: apiKey,
    model: model,
    temperature: isNaN(temperature) ? 0.3 : temperature
  }, function() {
    // 更新状态显示
    const status = document.getElementById('status');
    status.style.color = 'green';
    status.textContent = '设置已保存。';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
}

// 从 chrome.storage 中恢复选项
function restoreOptions() {
  chrome.storage.sync.get({
    apiUrl: '',
    apiKey: '',
    model: '',
    temperature: 0.3
  }, function(items) {
    document.getElementById('apiUrl').value = items.apiUrl;
    document.getElementById('apiKey').value = items.apiKey;
    document.getElementById('model').value = items.model;
    document.getElementById('temperature').value = items.temperature;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);