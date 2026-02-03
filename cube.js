/* Cube JavaScript */
let rotationX = 0;
let rotationY = 0;
let rotationZ = 0;
let isAutoRotate = true;
let isExploding = false;
let isLaunching = false;
const cube = document.getElementById('cube');
const curtain = document.getElementById('curtain');
const rocket = document.getElementById('rocket');

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
