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
const totalImages = 10;

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

function showCoverflow() {
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
}

function setupSwipeListeners() {
    const wrapper = document.querySelector('.coverflow-wrapper');
    
    // Touch events
    wrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    wrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    // Click on items
    const items = document.querySelectorAll('.coverflow-item');
    items.forEach((item, index) => {
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
    
    // Update progress bar
    const progress = ((currentIndex + 1) / totalImages) * 100;
    progressBar.style.width = progress + '%';
    
    items.forEach((item, index) => {
        const offset = index - centerIndex;
        const absOffset = Math.abs(offset);
        
        // Center item - bring forward with positive translateZ
        if (offset === 0) {
            item.style.transform = `translateX(-50%) translateY(-50%) translateZ(200px) scale(1.1)`;
            item.style.opacity = '1';
            item.style.zIndex = '100';
        }
        // Left items - keep at z=0 or slightly back
        else if (offset < 0) {
            const xPos = -50 + (offset * 100);
            const zPos = 0; // Keep at z=0 plane
            const rotateY = 45;
            const scale = 1 - (absOffset * 0.15);
            const opacity = Math.max(0.3, 1 - (absOffset * 0.3));
            
            item.style.transform = `translateX(${xPos}%) translateY(-50%) translateZ(${zPos}px) rotateY(${rotateY}deg) scale(${scale})`;
            item.style.opacity = opacity;
            item.style.zIndex = Math.max(1, 50 - absOffset * 10);
        }
        // Right items - keep at z=0 or slightly back
        else {
            const xPos = -50 + (offset * 100);
            const zPos = 0; // Keep at z=0 plane
            const rotateY = -45;
            const scale = 1 - (absOffset * 0.15);
            const opacity = Math.max(0.3, 1 - (absOffset * 0.3));
            
            item.style.transform = `translateX(${xPos}%) translateY(-50%) translateZ(${zPos}px) rotateY(${rotateY}deg) scale(${scale})`;
            item.style.opacity = opacity;
            item.style.zIndex = Math.max(1, 50 - absOffset * 10);
        }
    });
}

function nextImage() {
    currentIndex = (currentIndex + 1) % totalImages;
    updateCoverflow();
}

function prevImage() {
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