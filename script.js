let rotationX = 0;
let rotationY = 0;
let rotationZ = 0;
let isAutoRotate = true;
let isExploding = false;
let isLaunching = false;
const cube = document.getElementById('cube');
const curtain = document.getElementById('curtain');
const rocket = document.getElementById('rocket');
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

// Auto-show coverflow on load (tạm thời test)
// window.addEventListener('load', () => {
//     setTimeout(() => {
//         showCoverflow();
//     }, 500);
// });

// Swipe detection
let touchStartX = 0;
let touchEndX = 0;

function updateCubeRotation() {
    if (isAutoRotate && !isExploding) {
        cube.style.animation = 'rotateAuto 10s infinite linear';
    } else {
        cube.style.animation = 'none';
        if (!isExploding) {
            cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`;
        }
    }
}

function explodeAndRecover() {
    if (isExploding) return;
    isExploding = true;
    
    cube.classList.add('explode');
    triggerLaunch();
    
    setTimeout(() => {
        cube.classList.remove('explode');
        cube.classList.add('comeback');
        rotationX = 0;
        rotationY = 0;
        rotationZ = 0;
        isAutoRotate = true;
        
        setTimeout(() => {
            cube.classList.remove('comeback');
            isExploding = false;
            updateCubeRotation();
        }, 800);
    }, 1000);
}

function triggerLaunch() {
    if (isLaunching) return;
    isLaunching = true;

    console.log('🚀 Launching rocket and curtain!');
    document.body.classList.add('launch');

    setTimeout(() => {
        console.log('✅ Curtain up, showing coverflow');
        showCoverflow();
    }, 1500);

    setTimeout(() => {
        console.log('✅ Curtain down');
        document.body.classList.remove('launch');
        isLaunching = false;
    }, 2500);
}

async function showCoverflow() {
    await ensureCoverflowItems();
    coverflowContainer.classList.add('active');
    updateCoverflow();
    setupSwipeListeners();
    setupKeyboardListeners();
}

function closeCoverflow() {
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
        
        if (img) {
            // Tạo container reflection
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
            
            // Reflection tiêu đề
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
            
            // Tạo ảnh lật ngược
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
            
            // Reflection mô tả
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
    });

    wrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    // Click on items
    const itemsList = document.querySelectorAll('.coverflow-item');
    itemsList.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (index === currentIndex) return; // Skip if already center
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
    
    // Prevent drag on mouseleave
    wrapper.addEventListener('mouseleave', () => {
        isDragging = false;
    });
}

function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) {
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
    
    // Update progress bar
    const progress = ((currentIndex + 1) / totalImages) * 100;
    progressBar.style.width = progress + '%';
    
    // Arc layout parameters
    const radius = 600; // Bán kính của arc
    const anglePerItem = 25; // Góc giữa mỗi ảnh (độ)
    
    items.forEach((item, index) => {
        const offset = index - centerIndex;
        const angleRad = (offset * anglePerItem) * (Math.PI / 180);
        
        // Tính toán vị trí 3D dựa trên arc
        const xPos = Math.sin(angleRad) * radius;
        const zPos = -radius * (1 - Math.cos(angleRad));
        const rotateY = -offset * anglePerItem;
        
        // Center item - phóng to và ở trước
        if (offset === 0) {
            item.style.transform = `translateX(calc(-50% + ${xPos}px)) translateY(-50%) translateZ(${zPos + 100}px) rotateY(${rotateY}deg) scale(1.15)`;
            item.style.opacity = '1';
            item.style.zIndex = '100';
            item.style.filter = 'drop-shadow(0 20px 60px rgba(0, 0, 0, 0.6)) brightness(1.1)';
        }
        // Các ảnh khác
        else {
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

function rotateX() {
    if (isExploding) return;
    if (isAutoRotate) {
        isAutoRotate = false;
        cube.style.animation = 'none';
    }
    rotationX += 90;
    cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`;
}

function rotateY() {
    if (isExploding) return;
    if (isAutoRotate) {
        isAutoRotate = false;
        cube.style.animation = 'none';
    }
    rotationY += 90;
    cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`;
}

function rotateZ() {
    if (isExploding) return;
    if (isAutoRotate) {
        isAutoRotate = false;
        cube.style.animation = 'none';
    }
    rotationZ += 90;
    cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`;
}

function toggleAuto() {
    if (isExploding) return;
    isAutoRotate = !isAutoRotate;
    updateCubeRotation();
}

function resetRotation() {
    if (isExploding) return;
    rotationX = 0;
    rotationY = 0;
    rotationZ = 0;
    isAutoRotate = true;
    updateCubeRotation();
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

    totalImages = count;
    currentIndex = 0;
}