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