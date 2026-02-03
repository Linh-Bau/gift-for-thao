/* Coverflow Gallery JavaScript */
const coverflowContainer = document.getElementById('coverflowContainer');
const coverflow = document.getElementById('coverflow');
const progressBar = document.getElementById('progressBar');
let currentIndex = 0;
let totalImages = 0;
const maxImages = 50;
const coverflowBasePath = 'asserts/step_2/';
const imagePrefix = 'img_';
const imageExt = '.png';
const textExt = '.json';
let coverflowReady = false;

// Swipe detection
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

async function showCoverflow() {
    document.body.classList.add('stage-coverflow');
    await ensureCoverflowItems();
    coverflowContainer.classList.add('active');
    updateCoverflow();
    setupSwipeListeners();
    setupKeyboardListeners();
}

function closeCoverflow() {
    document.body.classList.remove('stage-coverflow');
    coverflowContainer.classList.remove('active');
    currentIndex = 0;
    updateCoverflow();
    removeKeyboardListeners();
    coverflow.innerHTML = '';
    totalImages = 0;
    progressBar.style.width = '0%';
    coverflowReady = false;
}

function setupSwipeListeners() {
    const wrapper = document.querySelector('.coverflow-wrapper');
    
    // Tạo reflection cho mỗi ảnh
    const items = document.querySelectorAll('.coverflow-item');
    items.forEach((item) => {
        const existingReflections = item.querySelectorAll('.coverflow-reflection');
        existingReflections.forEach((reflection) => reflection.remove());

        const img = item.querySelector('img');
        const title = item.querySelector('.coverflow-title');
        const description = item.querySelector('.coverflow-description');
        const hasContent = img || title || description;

        if (hasContent) {
            const reflectionDiv = document.createElement('div');
            reflectionDiv.className = 'coverflow-reflection';
            reflectionDiv.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                height: 120px;
                margin-top: 8px;
                perspective: 1000px;
                pointer-events: none;
                z-index: 10;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            `;
            
            if (title) {
                const reflectionTitle = document.createElement('div');
                reflectionTitle.textContent = title.textContent;
                reflectionTitle.style.cssText = `
                    color: white;
                    font-size: 0.95em;
                    font-weight: bold;
                    text-align: center;
                    transform: scaleY(-1);
                    filter: blur(1px);
                    opacity: 0.6;
                    -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
                    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
                `;
                reflectionDiv.appendChild(reflectionTitle);
            }
            
            if (img) {
                const reflectionImg = document.createElement('img');
                reflectionImg.src = img.src;
                reflectionImg.style.cssText = `
                    width: 100%;
                    height: 110px;
                    object-fit: cover;
                    transform: scaleY(-1);
                    filter: blur(1px);
                    display: block;
                    -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
                    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
                `;
                reflectionDiv.appendChild(reflectionImg);
            }
            
            if (description) {
                const reflectionDesc = document.createElement('div');
                reflectionDesc.textContent = description.textContent;
                reflectionDesc.style.cssText = `
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.85em;
                    text-align: center;
                    transform: scaleY(-1);
                    filter: blur(1px);
                    opacity: 0.5;
                    -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
                    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
                `;
                reflectionDiv.appendChild(reflectionDesc);
            }
            
            item.appendChild(reflectionDiv);
        }
    });
    
    // Touch events
    wrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });

    wrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    // Click on items
    const itemsList = document.querySelectorAll('.coverflow-item');
    itemsList.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (index === currentIndex) return;
            currentIndex = index;
            updateCoverflow();
        });
    });
    
    // Mouse drag (desktop)
    let isDragging = false;
    let startX = 0;
    
    wrapper.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        startX = e.clientX;
    });
    
    wrapper.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    });
    
    wrapper.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        isDragging = false;
        const endX = e.clientX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextImage();
            } else {
                prevImage();
            }
        }
    });
    
    wrapper.addEventListener('mouseleave', () => {
        isDragging = false;
    });
}

function handleSwipe() {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffY) > 50 && Math.abs(diffY) > Math.abs(diffX)) {
        return;
    }

    if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
            nextImage();
        } else {
            prevImage();
        }
    }
}

function handleKeyPress(e) {
    if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextImage();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevImage();
    } else if (e.key === 'Escape') {
        e.preventDefault();
        closeCoverflow();
    }
}

function setupKeyboardListeners() {
    document.addEventListener('keydown', handleKeyPress);
}

function removeKeyboardListeners() {
    document.removeEventListener('keydown', handleKeyPress);
}

function updateCoverflow() {
    const items = document.querySelectorAll('.coverflow-item');
    const centerIndex = currentIndex;

    if (totalImages === 0) {
        progressBar.style.width = '0%';
        return;
    }
    
    const progress = ((currentIndex + 1) / totalImages) * 100;
    progressBar.style.width = progress + '%';
    
    const radius = 600;
    const anglePerItem = 25;
    
    items.forEach((item, index) => {
        const offset = index - centerIndex;
        const angleRad = (offset * anglePerItem) * (Math.PI / 180);
        
        const xPos = Math.sin(angleRad) * radius;
        const zPos = -radius * (1 - Math.cos(angleRad));
        const rotateY = -offset * anglePerItem;
        
        if (offset === 0) {
            item.style.transform = `translateX(calc(-50% + ${xPos}px)) translateY(-50%) translateZ(${zPos + 100}px) rotateY(${rotateY}deg) scale(1.15)`;
            item.style.opacity = '1';
            item.style.zIndex = '100';
            item.style.filter = 'drop-shadow(0 20px 60px rgba(0, 0, 0, 0.6)) brightness(1.1)';
        } else {
            const absOffset = Math.abs(offset);
            const scale = Math.max(0.7, 1 - (absOffset * 0.1));
            const opacity = Math.max(0.3, 1 - (absOffset * 0.2));
            const shadowIntensity = 0.3 + (1 - opacity) * 0.3;
            
            item.style.transform = `translateX(calc(-50% + ${xPos}px)) translateY(-50%) translateZ(${zPos}px) rotateY(${rotateY}deg) scale(${scale})`;
            item.style.opacity = opacity;
            item.style.zIndex = Math.max(1, 50 - absOffset * 10);
            item.style.filter = `drop-shadow(0 15px 40px rgba(0, 0, 0, ${shadowIntensity})) brightness(${1 - absOffset * 0.1})`;
        }
    });
}

function nextImage() {
    if (totalImages === 0) return;
    currentIndex = (currentIndex + 1) % totalImages;
    updateCoverflow();
}

function prevImage() {
    if (totalImages === 0) return;
    currentIndex = (currentIndex - 1 + totalImages) % totalImages;
    updateCoverflow();
}

async function ensureCoverflowItems() {
    if (coverflowReady) return;
    coverflowReady = true;
    await loadCoverflowItems();
}

function imageExists(src) {
    return new Promise((resolve) => {
        const testImg = new Image();
        testImg.onload = () => resolve(true);
        testImg.onerror = () => resolve(false);
        testImg.src = src;
    });
}

async function fetchJsonSafe(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        return null;
    }
}

async function loadCoverflowItems() {
    const staticItems = Array.from(coverflow.querySelectorAll('[data-static="true"]')).map((item) => item.cloneNode(true));
    coverflow.innerHTML = '';

    let count = 0;
    for (let i = 1; i <= maxImages; i += 1) {
        const imageSrc = `${coverflowBasePath}${imagePrefix}${i}${imageExt}`;
        const exists = await imageExists(imageSrc);
        if (!exists) break;

        const textSrc = `${coverflowBasePath}${imagePrefix}${i}${textExt}`;
        const jsonContent = await fetchJsonSafe(textSrc);
        const titleText = jsonContent?.title?.trim() || `Ảnh ${i}`;
        const descText = jsonContent?.content?.trim() || '';

        const item = document.createElement('div');
        item.className = 'coverflow-item';

        const title = document.createElement('div');
        title.className = 'coverflow-title';
        title.textContent = titleText;

        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = `Image ${i}`;

        const description = document.createElement('div');
        description.className = 'coverflow-description';
        description.textContent = descText;

        item.appendChild(title);
        item.appendChild(img);
        item.appendChild(description);

        coverflow.appendChild(item);
        count += 1;
    }

    staticItems.forEach((item) => {
        coverflow.appendChild(item);
        count += 1;
    });

    totalImages = count;
    currentIndex = 0;
}
