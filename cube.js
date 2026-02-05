/**
 * Cube 3D Animation Module
 * Xử lý xoay cube, hiệu ứng nổ và chuyển cảnh sang coverflow
 */

// Cube rotation state
let rotationX = 0;
let rotationY = 0;
let rotationZ = 0;
let isAutoRotate = true;
let isExploding = false;
let isLaunching = false;

// DOM elements
const cube = document.getElementById('cube');
const curtain = document.getElementById('curtain');
const rocket = document.getElementById('rocket');

/**
 * Cập nhật animation xoay của cube
 * @returns {void}
 */
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

/**
 * Khởi động hiệu ứng nổ và phục hồi cube
 * @returns {void}
 */
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

/**
 * Kích hoạt hiệu ứng rocket bay và chuyển sang coverflow
 * @returns {void}
 */
function triggerLaunch() {
    if (isLaunching) return;
    isLaunching = true;

    console.log('🚀 Launching rocket and curtain!');
    document.body.classList.add('launch');

    setTimeout(() => {
        console.log('✅ Curtain up, showing coverflow');
        if (typeof showCoverflow === 'function') {
            showCoverflow();
        }
    }, 1500);

    setTimeout(() => {
        console.log('✅ Curtain down');
        document.body.classList.remove('launch');
        isLaunching = false;
    }, 2500);
}
