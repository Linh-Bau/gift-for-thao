/*
Giá trị mặc định:
- fade-in/ fade-out duration: 1000ms
*/

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setHuongDanText(text) {
    const huongDanElement = document.getElementById('huong_dan');
    huongDanElement.textContent = text;
}

async function setLayerTopMost(layerName) {
    const layer = document.querySelector(`#${layerName}`);
    layer.classList.remove('no-display');
    if (!layer) {
        console.error(`Layer ${layerName} not found`);
        return;
    }
    layer.classList.add('animation-fade-in');
    await sleep(1000); // chờ hiệu ứng kết thúc
    layer.style.zIndex = 10;
}

async function setLayerHidden(layerName) {
    const layer = document.querySelector(`#${layerName}`);

    if (!layer) {
        console.error(`Layer ${layerName} not found`);
        return;
    }
    layer.classList.add('animation-fade-out');
    await sleep(1000); // chờ hiệu ứng kết thúc
    layer.classList.add('no-display');
    layer.style.zIndex = 1;
}
// cube animation control
const cube = document.querySelector('.cube');
const cubeRotateClass = 'animation-cube-rotate';
const cubeExplodeClass = 'animation-cube-explode';

const setupCube = () => {
    // set zindex để đảm bảo layer 1 nằm trên cùng
    // setLayerTopMost('step-1');

    cube.addEventListener('click', async () => {
        // khi click dừng xoay
        cube.classList.remove(cubeRotateClass);
        // bật hiệu ứng nổ
        cube.classList.add(cubeExplodeClass);
        // thiết lập lại hướng dẫn
        setHuongDanText('Vuốt trái/phải hoặc ấn phím mũi tên để xem ảnh');
        // chuyển sang step tiếp theo
        await setLayerHidden('step-1');
        // 
        await setLayerTopMost('step-2');
    });
};

// coverflow animation control
let currentIndex = 0;
let totalImages = 0;

const progressBar = document.getElementById('progressBar');

const updateCoverflow = () => {
    const items = document.querySelectorAll('.coverflow-item');
    const radius = 600;
    const anglePerItem = 25;

    const progress = ((currentIndex + 1) / totalImages) * 100;
    progressBar.style.width = progress + '%';
    console.log('Progress:', progress);
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
        }
        else {
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
};

const prevImage = () => {
    currentIndex = (currentIndex - 1 + totalImages) % totalImages;
    updateCoverflow();
};

const nextImage = () => {
    currentIndex = (currentIndex + 1) % totalImages;
    updateCoverflow();
};

const setupSwipe = () => {
    const wrapper = document.querySelector('.coverflow-wrapper');
    let startX = 0; // vị trí X khi bắt đầu chạm
    wrapper.addEventListener('touchstart', e => {
        startX = e.changedTouches[0].screenX;
    });

    wrapper.addEventListener('touchend', e => {
        const endX = e.changedTouches[0].screenX;
        const diff = startX - endX;

        // logic nếu mà #step-2 đang display thì mới cho next/prev ảnh
        const step2Layer = document.getElementById('step-2');
        if (step2Layer.classList.contains('no-display') === false) {
            if (Math.abs(diff) > 50) {
                diff > 0 ? nextImage() : prevImage();
            }
        };
    });
};

const setupKeyboard = () => {
    document.addEventListener('keydown', e => {
        const step2Layer = document.getElementById('step-2');
        if (step2Layer.classList.contains('no-display') === false) {
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        }
    });
};

const nextToStep3 = async () => {
    // thiết lập lại hướng dẫn
    setHuongDanText('CLICK VÀO BỨC THƯ NHA');

    await setLayerHidden('step-2');
    await setLayerTopMost('step-3');
};

const setupLastImgAction = () => {
    const items = document.querySelectorAll('.coverflow-item');
    const lastItem = items[items.length - 1];
    // sự kiện swipe từ trên xuống dưới
    let startY = 0;
    lastItem.addEventListener('touchstart', e => {
        startY = e.changedTouches[0].screenY;
    });
    lastItem.addEventListener('touchend', async e => {
        const endY = e.changedTouches[0].screenY;
        const diff = startY - endY;
        const step2Layer = document.getElementById('step-2');
        if (step2Layer.classList.contains('no-display') === false) {
            if(currentIndex === totalImages -1)
            {    
                if (Math.abs(diff) > 50) {
                    diff > 0 ? nextToStep3() : null;
                };
            }
        };
    });
    // sự kiện ấn phím xuống
    document.addEventListener('keydown', async e => {
        if (e.key === 'ArrowDown') {
            const step2Layer = document.getElementById('step-2');
            if (step2Layer.classList.contains('no-display') === false) {
                if(currentIndex === totalImages -1){
                    await nextToStep3();
                };
            };
        }
    });
};

const setupCoverflow = () => {
    const items = document.querySelectorAll('.coverflow-item');
    totalImages = items.length;

    // thiết lập sự kiện swipe
    setupSwipe();
    // thiết lập sự kiện bàn phím
    setupKeyboard();
    // thiết lập sự kiện cho ảnh cuối
    setupLastImgAction();
    // hiển thị lần đầu
    updateCoverflow();
};


// envelope animation control
const setupEnvelope = () => {
    const envelope = document.querySelector('#envelope-group');
    const flap = document.querySelector('use[href="#envelope-flap"]');
    const paper = document.querySelector('use[href="#paper"]');
    let is_clicked = false;
    envelope.classList.add('envelope-group');
    envelope.addEventListener('click', async () => {
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
        await sleep(1000);
        // chuyển sang step tiếp theo
        setHuongDanText('');
        await setLayerHidden('step-3');
        await setLayerTopMost('step-4');
    });
};

// setup
document.addEventListener('DOMContentLoaded', () => {
    setupCube();
    setupCoverflow();
    setupEnvelope();
});
