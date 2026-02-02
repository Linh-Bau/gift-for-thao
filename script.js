let rotationX = 0;
let rotationY = 0;
let rotationZ = 0;
let isAutoRotate = true;
let isExploding = false;
const cube = document.getElementById('cube');

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