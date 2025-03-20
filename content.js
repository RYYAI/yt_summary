function createSubtitlePanel() {
  const panel = document.createElement('div');
  panel.id = 'yt-subtitle-panel';
  panel.innerHTML = `
    <div class="subtitle-header">视频要点</div>
    <div class="subtitle-content"></div>
  `;
  
  // 添加样式
  panel.style.cssText = `
    width: 95%;
    margin: 10px auto;
    padding: 15px;
    font-size: 16px;
    line-height: 1.5;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;
  
  const header = panel.querySelector('.subtitle-header');
  header.style.cssText = `
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #e0e0e0;
  `;
  
  const content = panel.querySelector('.subtitle-content');
  content.style.cssText = `
    font-size: 16px;
    line-height: 1.6;
    white-space: pre-wrap;
    max-height: 600px;
    overflow-y: auto;
    padding: 10px;
  `;
  
  return panel;
}

function extractVideoId(url) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    return urlParams.get('v');
}

// 添加获取视频标题的函数
function getVideoTitle() {
    const titleElement = document.querySelector('h1.style-scope.ytd-watch-metadata');
    return titleElement ? titleElement.textContent.trim() : '';
}

// 修改 summarizeSubtitles 函数，添加标题参数
async function summarizeSubtitles(subtitles, title) {
    try {
        // 尝试从存储中获取配置
        let config = {
            apiUrl: '',
            apiKey: '',
            model: '',
            temperature: 0.3
        };
        
        // 尝试从 chrome.storage 获取配置
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            try {
                config = await new Promise(resolve => {
                    chrome.storage.sync.get({
                        apiUrl: '',
                        apiKey: '',
                        model: '',
                        temperature: 0.3
                    }, resolve);
                });
            } catch (storageError) {
                console.warn('无法从存储中获取配置', storageError);
                return '请先在扩展选项中配置API信息';
            }
        } else {
            return '无法访问扩展存储，请确保已授予存储权限';
        }
        
        // 检查必要的配置是否存在
        if (!config.apiUrl || !config.apiKey || !config.model) {
            return '请先在扩展选项中配置API地址、密钥和模型名称';
        }
        
        const response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [{
                    role: "user",
                    content: `这是一个标题为"${title}"的YouTube视频的字幕\n\n${subtitles}，请根据标题和以下字幕内容，用中文逐条列出视频的要点：`
                }],
                temperature: config.temperature
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('API Response:', errorData);
            throw new Error(`API 请求失败: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response Data:', data);
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('API 返回格式错误');
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('总结失败:', error);
        return `无法生成总结: ${error.message}`;
    }
}

async function fetchSubtitles(videoId) {
    try {
        // 减少最大等待时间
        let playerResponse = null;
        let attempts = 0;
        const maxAttempts = 5; // 从10减少到5

        while (!playerResponse && attempts < maxAttempts) {
            playerResponse = window.ytInitialPlayerResponse;
            if (!playerResponse) {
                await new Promise(resolve => setTimeout(resolve, 500)); // 从1000ms减少到500ms
                attempts++;
            }
        }

        if (!playerResponse) {
            // 尝试从页面脚本中获取
            const scripts = document.getElementsByTagName('script');
            for (const script of scripts) {
                const content = script.textContent;
                if (content && content.includes('ytInitialPlayerResponse')) {
                    const match = content.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
                    if (match) {
                        playerResponse = JSON.parse(match[1]);
                        break;
                    }
                }
            }
        }

        if (!playerResponse) {
            return '无法获取视频信息，请刷新页面重试';
        }

        // 获取字幕信息
        const captions = playerResponse.captions;
        if (captions && captions.playerCaptionsTracklistRenderer) {
            const tracks = captions.playerCaptionsTracklistRenderer.captionTracks;
            if (tracks && tracks.length > 0) {
                // 获取第一个字幕轨道的内容
                const firstTrack = tracks[0];

                try {
                    const subtitleUrl = `${firstTrack.baseUrl}&fmt=json3`;
                    subtitleText = '正在获取字幕...\n';
                    
                    // 并行发起字幕请求
                    const [response] = await Promise.all([
                        fetch(subtitleUrl),
                        new Promise(resolve => setTimeout(resolve, 100))
                    ]);
                    
                    const subtitleData = await response.json();
                    
                    if (subtitleData.events) {
                        let fullSubtitleText = '';
                        subtitleData.events.forEach(event => {
                            if (event.segs) {
                                const text = event.segs.map(seg => seg.utf8).join('').trim();
                                if (text) {
                                    fullSubtitleText += text + ' ';
                                }
                            }
                        });

                        // 获取视频标题
                        const videoTitle = getVideoTitle();
                        
                        // 显示正在总结的状态
                        subtitleText = '正在生成视频要点总结...\n';
                        
                        // 调用 LLM API 获取总结，传入标题
                        const summary = await summarizeSubtitles(fullSubtitleText, videoTitle);
                        return `视频《${videoTitle}》要点总结：\n${summary}`;
                    }
                } catch (subtitleError) {
                    return '无法加载字幕内容\n';
                }
            }
        }

        return '该视频无字幕';
    } catch (error) {
        console.error('获取字幕失败:', error);
        return '获取字幕信息失败，请刷新页面重试';
    }
}

// 添加时间格式化函数
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function init() {
    const checkInterval = setInterval(() => {
        const videoContainer = document.querySelector('#secondary');
        if (videoContainer) {
            clearInterval(checkInterval);
            const panel = createSubtitlePanel();
            videoContainer.insertBefore(panel, videoContainer.firstChild);
            
            const subtitleContent = panel.querySelector('.subtitle-content');
            
            // 获取视频ID并获取字幕
            const videoId = extractVideoId(window.location.href);
            if (videoId) {
                subtitleContent.textContent = '正在获取视频信息...';
                // 添加延迟，确保页面内容已更新
                setTimeout(() => {
                    fetchSubtitles(videoId).then(subtitles => {
                        subtitleContent.textContent = subtitles;
                    });
                }, 1500);
            }

            // 使用更可靠的方式监听视频变化
            let lastVideoId = videoId;
            setInterval(() => {
                const currentUrl = window.location.href;
                const newVideoId = extractVideoId(currentUrl);
                
                // 只有当视频ID变化时才更新
                if (newVideoId && newVideoId !== lastVideoId) {
                    lastVideoId = newVideoId;
                    subtitleContent.textContent = '正在获取视频信息...';
                    
                    // 添加延迟，确保页面内容已更新
                    setTimeout(() => {
                        fetchSubtitles(newVideoId).then(subtitles => {
                            subtitleContent.textContent = subtitles;
                        });
                    }, 1500);
                }
            }, 1000);
        }
    }, 1000);
}

init();