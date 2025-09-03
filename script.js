document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'https://apk-downloader.bjcoderx.workers.dev/';
    
    // DOM Elements
    const searchBtn = document.getElementById('searchBtn' );
    const searchInput = document.getElementById('apkSearch');
    const statusMessageEl = document.getElementById('statusMessage');
    const resultsEl = document.getElementById('results');
    const themeToggle = document.getElementById('checkbox');
    const docElement = document.documentElement;

    // --- Event Listeners ---
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    themeToggle.addEventListener('change', switchTheme);

    // --- Theme Management ---
    function switchTheme(e) {
        const theme = e.target.checked ? 'dark' : 'light';
        docElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            docElement.setAttribute('data-theme', savedTheme);
            themeToggle.checked = savedTheme === 'dark';
        } else if (prefersDark) {
            docElement.setAttribute('data-theme', 'dark');
            themeToggle.checked = true;
        } else {
            docElement.setAttribute('data-theme', 'light');
        }
    }

    // --- API & Search Logic ---
    async function handleSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            showStatus('Please enter an app name to search.', 'error');
            return;
        }
        
        setLoadingState(true);
        
        try {
            // Simulate network delay to see skeleton loader
            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await fetch(`${API_BASE}?query=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            
            const data = await response.json();
            if (data && data.length > 0) {
                displayResults(data);
            } else {
                showStatus('No apps found for your search. Please try another name.', 'error');
            }
        } catch (error) {
            console.error('Search Error:', error);
            showStatus('Failed to fetch app data. Please check your connection.', 'error');
        } finally {
            setLoadingState(false);
        }
    }

    function setLoadingState(isLoading) {
        searchBtn.disabled = isLoading;
        searchBtn.textContent = isLoading ? 'Searching...' : 'Search APK';
        statusMessageEl.style.display = 'none';
        
        if (isLoading) {
            displaySkeleton();
        } else {
            // The skeleton is cleared by displayResults or showStatus
        }
    }

    function displaySkeleton() {
        resultsEl.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const skeletonItem = document.createElement('div');
            skeletonItem.className = 'apk-item skeleton';
            skeletonItem.innerHTML = `
                <div class="apk-header">
                    <div class="apk-icon"></div>
                    <div style="flex: 1;">
                        <div class="skeleton-text"></div>
                    </div>
                </div>
                <div class="apk-details">
                    <div class="skeleton-text-sm"></div>
                </div>
                <div class="skeleton-btn"></div>
            `;
            resultsEl.appendChild(skeletonItem);
        }
    }

    function displayResults(apks) {
        resultsEl.innerHTML = '';
        apks.forEach((apk, index) => {
            const apkItem = document.createElement('div');
            apkItem.className = 'apk-item';
            apkItem.style.animationDelay = `${index * 0.1}s`;
            
            apkItem.innerHTML = `
                <div class="apk-header">
                    <img src="${apk.image}" alt="${apk.name}" class="apk-icon" loading="lazy" onerror="this.style.display='none'">
                    <div class="apk-name">${apk.name || 'Unknown App'}</div>
                </div>
                <div class="apk-details">
                    <strong>Version:</strong> ${apk.version || 'N/A'} | <strong>Size:</strong> ${apk.filesize || 'N/A'}
                </div>
                <button class="apk-download-btn" onclick="downloadAPK('${apk.path}', '${apk.name}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>
                    Download
                </button>
            `;
            resultsEl.appendChild(apkItem );
        });
    }

    // Make function global for inline onclick
    window.downloadAPK = function(downloadUrl, apkName) {
        try {
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${(apkName || 'app').replace(/[^a-zA-Z0-9.-]/g, '_')}.apk`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showStatus(`Download for ${apkName} has started.`, 'success');
        } catch (error) {
            console.error('Download Error:', error);
            showStatus('Failed to start the download.', 'error');
        }
    }

    function showStatus(message, type = 'error') {
        resultsEl.innerHTML = ''; // Clear any existing results or skeletons
        statusMessageEl.textContent = message;
        statusMessageEl.className = `status-message ${type}`;
        statusMessageEl.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => { statusMessageEl.style.display = 'none'; }, 4000);
        }
    }

    // Initialize the theme on page load
    initTheme();
});
