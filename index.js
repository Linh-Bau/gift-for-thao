// function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// biến

// objects
const container_1 = document.querySelector('.container-3d');
const rocket_container = document.querySelector('.rocket-container');
const cube = document.querySelector('.cube');

const rocket = document.querySelector('.rocket-item');
const coverflow = document.getElementById('coverflow');
const progressBar = document.getElementById('progressBar');

const coverflowContainer = document.querySelector('.coverflow-container');


// sự kiện

cube.addEventListener('click', async () => {
    cube.classList.remove('cube-rotate');
    cube.classList.add('cube-explode');
    container_1.classList.add('fade-out');
    await sleep(500);
    rocket_container.classList.remove('no-display');
    rocket.classList.add('fly-up');
    await sleep(2000);
    rocket_container.classList.add('fade-out');
    await sleep(1000);
    coverflowContainer.classList.remove('no-display');
    coverflowContainer.classList.add('fade-in');
});



let currentIndex = 0;
let totalImages = 0;

function initCoverflow() {
    const items = document.querySelectorAll('.coverflow-item');
    totalImages = items.length;
    setupClick();
    setupSwipe();
    setupKeyboard();
    updateCoverflow();
}

function updateCoverflow() {
    const items = document.querySelectorAll('.coverflow-item');
    const radius = 600;
    const anglePerItem = 25;

    const progress = ((currentIndex + 1) / totalImages) * 100;
    progressBar.style.width = progress + '%';

    items.forEach((item, index) => {
        const offset = index - currentIndex;
        const angleRad = offset * anglePerItem * (Math.PI / 180);

        const xPos = Math.sin(angleRad) * radius;
        const zPos = -radius * (1 - Math.cos(angleRad));
        const rotateY = -offset * anglePerItem;

        if (offset === 0) {
            item.style.transform =
                `translateX(calc(-50% + ${xPos}px))
                 translateY(-50%)
                 translateZ(${zPos + 100}px)
                 rotateY(${rotateY}deg)
                 scale(1.15)`;

            item.style.opacity = '1';
            item.style.zIndex = '100';
        } else {
            const absOffset = Math.abs(offset);
            const scale = Math.max(0.7, 1 - absOffset * 0.1);
            const opacity = Math.max(0.3, 1 - absOffset * 0.2);

            item.style.transform =
                `translateX(calc(-50% + ${xPos}px))
                 translateY(-50%)
                 translateZ(${zPos}px)
                 rotateY(${rotateY}deg)
                 scale(${scale})`;

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


function setupClick() {
    const items = document.querySelectorAll('.coverflow-item');

    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (index === currentIndex) return;
            currentIndex = index;
            updateCoverflow();
        });
    });
}


let startX = 0;

function setupSwipe() {
    const wrapper = document.querySelector('.coverflow-wrapper');

    wrapper.addEventListener('touchstart', e => {
        startX = e.changedTouches[0].screenX;
    });

    wrapper.addEventListener('touchend', e => {
        const endX = e.changedTouches[0].screenX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) {
            diff > 0 ? nextImage() : prevImage();
        }
    });
}

function setupKeyboard() {
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });
}


// khởi tạo
initCoverflow();


const envelope = document.querySelector('#envelope-group');
const flap = document.querySelector('use[href="#envelope-flap"]');
const paper = document.querySelector('use[href="#paper"]');
const is_clicked = false;

envelope.classList.add('envelope-group');



envelope.addEventListener('click', () => {
    if (is_clicked) {
        return;
    }
    // remove shake animation
    envelope.classList.remove('envelope-group');

    // thêm mở nắp phong bì
    flap.classList.add('open-flap');

    // đặt nắp phong bì ra phía sau giấy (SVG không hỗ trợ z-index)
    envelope.insertBefore(flap, paper);

    // thêm di chuyển giấy
    paper.classList.add('move-paper');

    is_clicked = true;
});