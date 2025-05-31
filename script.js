// Global Variables
let currentVideoData = null;

// Component Loading Function
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeComponents();
});

async function initializeComponents() {
    // Load header and footer components
    await loadComponent('global-header', 'header.html');
    await loadComponent('global-footer', 'footer.html');

    // Initialize app after components are loaded
    setTimeout(() => {
        initializeApp();
    }, 100);
}

function initializeApp() {
    // Get DOM elements after they're loaded
    const urlInput = document.getElementById('instagram-url');
    const downloadBtn = document.getElementById('download-btn');
    const loadingSection = document.getElementById('loading-section');
    const resultsSection = document.getElementById('results-section');
    const previewVideo = document.getElementById('preview-video');
    const resetBtn = document.getElementById('reset-btn');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Only add event listeners if elements exist
    if (downloadBtn && urlInput) {
        downloadBtn.addEventListener('click', handleDownload);
        urlInput.addEventListener('input', handleInputChange);
        urlInput.addEventListener('paste', handlePaste);
        urlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleDownload();
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetDownloader);
    }

    // Mobile navigation
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Quality button event listeners
    const qualityButtons = document.querySelectorAll('.quality-btn');
    if (qualityButtons.length > 0) {
        qualityButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const quality = this.dataset.quality;
                downloadVideo(quality);
            });
        });
    }

    // Dropdown navigation handling
    const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
    if (dropdownToggles.length > 0) {
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                // On mobile, toggle the dropdown
                if (window.innerWidth <= 768) {
                    const dropdown = this.parentElement;
                    const menu = dropdown.querySelector('.nav-dropdown-menu');
                    if (menu) {
                        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                    }
                }
            });
        });
    }

    // Smooth scrolling for navigation links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    if (anchorLinks.length > 0) {
        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Close mobile navigation when clicking outside
    document.addEventListener('click', function(e) {
        if (hamburger && navMenu && !hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // SEO and Analytics Enhancements

    // Add structured data for user interactions
    function trackUserInteraction(action, element) {
        // Analytics tracking can be added here
        console.log(`User interaction: ${action} on ${element}`);

        // Send to Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': 'engagement',
                'event_label': element
            });
        }
    }

    // Track download button clicks
    const downloadBtnMain = document.getElementById('download-btn');
    if (downloadBtnMain) {
        downloadBtnMain.addEventListener('click', function() {
            trackUserInteraction('download_attempt', 'main_download_button');
        });
    }

    // Track quality button selections
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quality-btn')) {
            const quality = e.target.getAttribute('data-quality');
            trackUserInteraction('quality_selection', quality);
        }
    });

    // Improve Core Web Vitals - Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Add schema.org microdata dynamically
    function addMicrodata() {
        const downloadButtons = document.querySelectorAll('.download-btn, .quality-btn');
        downloadButtons.forEach(button => {
            button.setAttribute('itemprop', 'potentialAction');
            button.setAttribute('itemscope', '');
            button.setAttribute('itemtype', 'https://schema.org/DownloadAction');
        });
    }

    addMicrodata();

    // Performance monitoring for Core Web Vitals
    if ('PerformanceObserver' in window) {
        // Monitor Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                console.log('LCP:', entry.startTime);
            }
        }).observe({entryTypes: ['largest-contentful-paint']});

        // Monitor First Input Delay
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                console.log('FID:', entry.processingStart - entry.startTime);
            }
        }).observe({entryTypes: ['first-input']});
    }
}

function handleInputChange() {
    const urlInput = document.getElementById('instagram-url');
    const downloadBtn = document.getElementById('download-btn');
    const downloaderCard = document.querySelector('.downloader-card');

    if (!urlInput || !downloadBtn) return;

    const url = urlInput.value.trim();
    const isValidInstagramUrl = isValidInstagramURL(url);

    downloadBtn.disabled = !isValidInstagramUrl;

    if (url && isValidInstagramUrl) {
        downloaderCard.classList.add('has-valid-url');
        showPreviewPanel();
        clearError();
    } else if (url && !isValidInstagramUrl) {
        downloaderCard.classList.remove('has-valid-url');
        hidePreviewPanel();
        showError('Please enter a valid Instagram URL');
    } else {
        downloaderCard.classList.remove('has-valid-url');
        hidePreviewPanel();
        clearError();
    }
}

function handlePaste(e) {
    setTimeout(() => {
        handleInputChange();
        const urlInput = document.getElementById('instagram-url');
        if (urlInput && isValidInstagramURL(urlInput.value.trim())) {
            showInstantPreview();
        }
    }, 100);
}

function showPreviewPanel() {
    const downloaderCard = document.querySelector('.downloader-card');
    let previewPanel = downloaderCard.querySelector('.instant-preview-panel');
    
    if (!previewPanel) {
        previewPanel = document.createElement('div');
        previewPanel.className = 'instant-preview-panel';
        previewPanel.innerHTML = `
            <div class="preview-content">
                <div class="preview-thumbnail">
                    <div class="thumbnail-placeholder">
                        <i class="fab fa-instagram"></i>
                        <span>Content Preview</span>
                    </div>
                </div>
                <div class="preview-info">
                    <h4>Ready to Download</h4>
                    <p>Click download to get your Instagram content</p>
                    <div class="preview-actions">
                        <button class="instant-download-btn" onclick="handleDownload()">
                            <i class="fas fa-download"></i>
                            Download Now
                        </button>
                    </div>
                </div>
            </div>
        `;
        downloaderCard.appendChild(previewPanel);
    }
    
    previewPanel.style.display = 'block';
    setTimeout(() => {
        previewPanel.classList.add('show');
    }, 10);
}

function hidePreviewPanel() {
    const previewPanel = document.querySelector('.instant-preview-panel');
    if (previewPanel) {
        previewPanel.classList.remove('show');
        setTimeout(() => {
            previewPanel.style.display = 'none';
        }, 300);
    }
}

function showInstantPreview() {
    const previewPanel = document.querySelector('.instant-preview-panel');
    if (previewPanel) {
        const thumbnail = previewPanel.querySelector('.thumbnail-placeholder');
        thumbnail.innerHTML = `
            <div class="loading-thumbnail">
                <div class="mini-spinner"></div>
                <span>Loading preview...</span>
            </div>
        `;
        
        // Simulate loading preview
        setTimeout(() => {
            thumbnail.innerHTML = `
                <img src="https://via.placeholder.com/120x120/667eea/ffffff?text=IG" alt="Preview">
                <div class="preview-overlay">
                    <i class="fas fa-play-circle"></i>
                </div>
            `;
        }, 1500);
    }
}

function validateInput() {
    handleInputChange();
}

function isValidInstagramURL(url) {
    const instagramRegex = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|tv)\/[A-Za-z0-9_-]+/;
    return instagramRegex.test(url);
}

async function handleDownload() {
    const urlInput = document.getElementById('instagram-url');
    if (!urlInput) return;

    const url = urlInput.value.trim();

    if (!isValidInstagramURL(url)) {
        showError('Please enter a valid Instagram URL');
        return;
    }

    showLoading();

    try {
        // Simulate API call to process Instagram URL
        await simulateVideoProcessing(url);

        // For demo purposes, we'll show a sample result
        const videoData = {
            videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            thumbnail: 'https://via.placeholder.com/400x400/667eea/ffffff?text=Instagram+Video',
            title: 'Instagram Video',
            duration: '0:30'
        };

        currentVideoData = videoData;
        showResults(videoData);

    } catch (error) {
        hideLoading();
        showError('Failed to process the video. Please try again.');
        console.error('Download error:', error);
    }
}

function simulateVideoProcessing(url) {
    return new Promise((resolve) => {
        // Simulate processing time
        setTimeout(() => {
            resolve();
        }, 3000);
    });
}

function showLoading() {
    const downloadBtn = document.getElementById('download-btn');
    const loadingSection = document.getElementById('loading-section');
    const resultsSection = document.getElementById('results-section');

    if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }

    if (loadingSection) {
        loadingSection.style.display = 'block';
    }

    if (resultsSection) {
        resultsSection.style.display = 'none';
    }

    clearError();
}

function hideLoading() {
    const downloadBtn = document.getElementById('download-btn');
    const loadingSection = document.getElementById('loading-section');

    if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
    }

    if (loadingSection) {
        loadingSection.style.display = 'none';
    }
}

function showResults(videoData) {
    hideLoading();

    const previewVideo = document.getElementById('preview-video');
    const resultsSection = document.getElementById('results-section');

    // Set video preview
    if (previewVideo) {
        previewVideo.src = videoData.videoUrl;
        previewVideo.poster = videoData.thumbnail;
    }

    // Show results section with animation
    if (resultsSection) {
        resultsSection.style.display = 'block';
        resultsSection.style.animation = 'fadeInUp 0.6s ease-out';

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function downloadVideo(quality) {
    if (!currentVideoData) return;

    // Create download link
    const link = document.createElement('a');
    link.href = currentVideoData.videoUrl;
    link.download = `instagram_video_${quality}.mp4`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    showSuccess(`Video download started in ${quality.toUpperCase()} quality!`);
}

function resetDownloader() {
    const urlInput = document.getElementById('instagram-url');
    const loadingSection = document.getElementById('loading-section');
    const resultsSection = document.getElementById('results-section');
    const downloadBtn = document.getElementById('download-btn');

    if (urlInput) urlInput.value = '';

    currentVideoData = null;

    if (loadingSection) loadingSection.style.display = 'none';
    if (resultsSection) resultsSection.style.display = 'none';

    if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
    }

    clearError();
    clearSuccess();

    // Scroll back to top
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function showError(message) {
    clearError();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;

    const downloaderCard = document.querySelector('.downloader-card');
    if (downloaderCard) {
        downloaderCard.appendChild(errorDiv);
        setTimeout(clearError, 5000);
    }
}

function clearError() {
    const errorMessage = document.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function showSuccess(message) {
    clearSuccess();
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

    const downloaderCard = document.querySelector('.downloader-card');
    if (downloaderCard) {
        downloaderCard.appendChild(successDiv);
        setTimeout(clearSuccess, 5000);
    }
}

function clearSuccess() {
    const successMessage = document.querySelector('.success-message');
    if (successMessage) {
        successMessage.remove();
    }
}

// Utility Functions for Reusability
window.GlobalDownloader = {
    // Function to create a new downloader instance on any page
    createDownloader: function(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const defaultOptions = {
            placeholder: 'Paste Instagram video URL here...',
            buttonText: 'Download',
            showPreview: true,
            autoReset: false
        };

        const config = { ...defaultOptions, ...options };

        // Create downloader HTML
        const downloaderHTML = `
            <div class="downloader-card">
                <div class="input-section">
                    <div class="input-wrapper">
                        <i class="fab fa-instagram input-icon"></i>
                        <input type="url" class="url-input" placeholder="${config.placeholder}">
                        <button class="download-btn">
                            <i class="fas fa-download"></i>
                            ${config.buttonText}
                        </button>
                    </div>
                </div>

                <div class="loading-section" style="display: none;">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                    </div>
                    <p class="loading-text">Processing your Instagram video...</p>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>

                ${config.showPreview ? `
                <div class="results-section" style="display: none;">
                    <div class="video-preview">
                        <video controls poster="">
                            <source src="" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div class="download-options">
                        <h3>Download Options</h3>
                        <div class="quality-buttons">
                            <button class="quality-btn" data-quality="hd">
                                <i class="fas fa-video"></i>
                                HD Quality
                            </button>
                            <button class="quality-btn" data-quality="sd">
                                <i class="fas fa-mobile-alt"></i>
                                Mobile Quality
                            </button>
                        </div>
                        <button class="reset-btn">
                            <i class="fas fa-redo"></i>
                            Download Another Video
                        </button>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        container.innerHTML = downloaderHTML;

        // Initialize the new downloader instance
        this.initializeDownloaderInstance(container);
    },

    initializeDownloaderInstance: function(container) {
        const urlInput = container.querySelector('.url-input');
        const downloadBtn = container.querySelector('.download-btn');
        const loadingSection = container.querySelector('.loading-section');
        const resultsSection = container.querySelector('.results-section');
        const resetBtn = container.querySelector('.reset-btn');

        // Add event listeners for this instance
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const url = urlInput.value.trim();
                if (isValidInstagramURL(url)) {
                    this.processDownload(container, url);
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetInstance(container);
            });
        }

        if (urlInput) {
            urlInput.addEventListener('input', () => {
                const url = urlInput.value.trim();
                downloadBtn.disabled = !isValidInstagramURL(url);
            });
        }
    },

    processDownload: async function(container, url) {
        const loadingSection = container.querySelector('.loading-section');
        const resultsSection = container.querySelector('.results-section');
        const downloadBtn = container.querySelector('.download-btn');

        // Show loading
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        loadingSection.style.display = 'block';
        if (resultsSection) resultsSection.style.display = 'none';

        try {
            await simulateVideoProcessing(url);

            // Show results if preview is enabled
            if (resultsSection) {
                const videoData = {
                    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                    thumbnail: 'https://via.placeholder.com/400x400/667eea/ffffff?text=Instagram+Video'
                };

                const video = resultsSection.querySelector('video');
                if (video) {
                    video.src = videoData.videoUrl;
                    video.poster = videoData.thumbnail;
                }

                loadingSection.style.display = 'none';
                resultsSection.style.display = 'block';
            } else {
                // Direct download without preview
                this.downloadVideo('hd');
                loadingSection.style.display = 'none';
            }

            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';

        } catch (error) {
            loadingSection.style.display = 'none';
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
            console.error('Download error:', error);
        }
    },

    resetInstance: function(container) {
        const urlInput = container.querySelector('.url-input');
        const loadingSection = container.querySelector('.loading-section');
        const resultsSection = container.querySelector('.results-section');
        const downloadBtn = container.querySelector('.download-btn');

        urlInput.value = '';
        loadingSection.style.display = 'none';
        if (resultsSection) resultsSection.style.display = 'none';
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
    }
};