
// Global Variables
let currentVideoData = null;

// DOM Elements
const urlInput = document.getElementById('instagram-url');
const downloadBtn = document.getElementById('download-btn');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');
const previewVideo = document.getElementById('preview-video');
const resetBtn = document.getElementById('reset-btn');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Add event listeners
    downloadBtn.addEventListener('click', handleDownload);
    resetBtn.addEventListener('click', resetDownloader);
    urlInput.addEventListener('input', validateInput);
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleDownload();
        }
    });

    // Mobile navigation
    hamburger.addEventListener('click', toggleMobileNav);

    // Quality button event listeners
    document.querySelectorAll('.quality-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const quality = this.dataset.quality;
            downloadVideo(quality);
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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

function toggleMobileNav() {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function validateInput() {
    const url = urlInput.value.trim();
    const isValidInstagramUrl = isValidInstagramURL(url);
    
    downloadBtn.disabled = !isValidInstagramUrl;
    
    if (url && !isValidInstagramUrl) {
        showError('Please enter a valid Instagram URL');
    } else {
        clearError();
    }
}

function isValidInstagramURL(url) {
    const instagramRegex = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|tv)\/[A-Za-z0-9_-]+/;
    return instagramRegex.test(url);
}

async function handleDownload() {
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
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    loadingSection.style.display = 'block';
    resultsSection.style.display = 'none';
    clearError();
}

function hideLoading() {
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
    loadingSection.style.display = 'none';
}

function showResults(videoData) {
    hideLoading();
    
    // Set video preview
    previewVideo.src = videoData.videoUrl;
    previewVideo.poster = videoData.thumbnail;
    
    // Show results section with animation
    resultsSection.style.display = 'block';
    resultsSection.style.animation = 'fadeInUp 0.6s ease-out';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
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
    urlInput.value = '';
    currentVideoData = null;
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'none';
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
    clearError();
    clearSuccess();
    
    // Scroll back to top
    document.querySelector('.hero-section').scrollIntoView({ behavior: 'smooth' });
}

function showError(message) {
    clearError();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    
    const downloaderCard = document.querySelector('.downloader-card');
    downloaderCard.appendChild(errorDiv);
    
    setTimeout(clearError, 5000);
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
    downloaderCard.appendChild(successDiv);
    
    setTimeout(clearSuccess, 5000);
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

// Global Header and Footer Functions
window.GlobalComponents = {
    // Function to create global header on any page
    createHeader: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const headerHTML = `
            <header class="global-header">
                <nav class="nav-container">
                    <div class="logo">
                        <i class="fab fa-instagram"></i>
                        <span>InstaDownloader</span>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#how-it-works">How It Works</a></li>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#faq">FAQ</a></li>
                    </ul>
                    <div class="hamburger">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </nav>
            </header>
        `;
        
        container.innerHTML = headerHTML;
        
        // Initialize mobile navigation
        const hamburger = container.querySelector('.hamburger');
        const navMenu = container.querySelector('.nav-menu');
        
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    },
    
    // Function to create global footer on any page
    createFooter: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const footerHTML = `
            <footer class="global-footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <div class="footer-logo">
                                <i class="fab fa-instagram"></i>
                                <span>InstaDownloader</span>
                            </div>
                            <p>The fastest and most reliable Instagram video downloader. Download videos, reels, and IGTV content for free.</p>
                        </div>
                        <div class="footer-section">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><a href="#home">Home</a></li>
                                <li><a href="#how-it-works">How It Works</a></li>
                                <li><a href="#features">Features</a></li>
                                <li><a href="#faq">FAQ</a></li>
                            </ul>
                        </div>
                        <div class="footer-section">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="/privacy">Privacy Policy</a></li>
                                <li><a href="/terms">Terms of Service</a></li>
                                <li><a href="/disclaimer">Disclaimer</a></li>
                            </ul>
                        </div>
                        <div class="footer-section">
                            <h4>Support</h4>
                            <ul>
                                <li><a href="/contact">Contact Us</a></li>
                                <li><a href="/help">Help Center</a></li>
                                <li><a href="/report">Report Issue</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2024 InstaDownloader. All rights reserved. Made with ❤️ on Replit</p>
                    </div>
                </div>
            </footer>
        `;
        
        container.innerHTML = footerHTML;
    }
};

// Auto-initialize components if containers exist
document.addEventListener('DOMContentLoaded', function() {
    // Auto-create header if container exists
    if (document.getElementById('global-header-container')) {
        GlobalComponents.createHeader('global-header-container');
    }
    
    // Auto-create footer if container exists
    if (document.getElementById('global-footer-container')) {
        GlobalComponents.createFooter('global-footer-container');
    }
    
    // Auto-create downloader if container exists
    if (document.getElementById('global-downloader-container')) {
        GlobalDownloader.createDownloader('global-downloader-container');
    }
});
