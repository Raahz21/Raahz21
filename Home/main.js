document.addEventListener('DOMContentLoaded', function () {
    const img = document.querySelector('.pic img');
    const container = document.querySelector('.name'); // or use .header for a larger area
    if (!img || !container) return;

    // Create a hidden canvas for pixel detection
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let ready = false;

    img.addEventListener('load', drawToCanvas);
    if (img.complete) drawToCanvas();

    function drawToCanvas() {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        ready = true;
    }

    container.addEventListener('mousemove', function (e) {
        if (!ready) return;
        const rect = img.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Set the radius (in px) within which the image will move
        const radius = Math.max(rect.width, rect.height) * 0.8;

        if (distance < radius) {
            img.classList.add('floating-effect');
            // Move away from the cursor, stronger when closer
            const maxTranslate = 80;
            // Normalize and invert direction
            const norm = Math.max(1, distance / radius);
            const tx = -(dx / radius) * (maxTranslate / norm);
            const ty = -(dy / radius) * (maxTranslate / norm);
            img.style.transform = `translate(${tx}px, ${ty}px)`;

            // Calculate shadow offsets in the same direction as the image, but larger
            const shadow1 = `${tx + 8}px ${ty}px 0 rgba(80,80,80,0.7)`;
            const shadow2 = `${tx + 16}px ${ty}px 0 rgba(120,120,120,0.5)`;
            const shadow3 = `${tx + 24}px ${ty}px 0 rgba(180,180,180,0.4)`;
            img.style.filter = `drop-shadow(${shadow1}) drop-shadow(${shadow2}) drop-shadow(${shadow3})`;
        } else {
            img.classList.remove('floating-effect');
            img.style.transform = '';
            img.style.filter = `
                drop-shadow(8px 0 0 rgba(80,80,80,0.7))
                drop-shadow(16px 0 0 rgba(120,120,120,0.5))
                drop-shadow(24px 0 0 rgba(180,180,180,0.4))
            `;
        }
    });

    container.addEventListener('mouseleave', function () {
        img.classList.remove('floating-effect');
        img.style.transform = '';
        img.style.filter = `
            drop-shadow(8px 0 0 rgba(80,80,80,0.7))
            drop-shadow(16px 0 0 rgba(120,120,120,0.5))
            drop-shadow(24px 0 0 rgba(180,180,180,0.4))
        `;
    });

    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (!query) return;

            // Remove previous highlights
            document.querySelectorAll('.search-highlight').forEach(el => {
                el.classList.remove('search-highlight');
            });
            document.querySelectorAll('.search-mark').forEach(el => {
                // unwrap the mark
                const parent = el.parentNode;
                parent.replaceChild(document.createTextNode(el.textContent), el);
                parent.normalize();
            });

            // Search and highlight
            const contentSelectors = [
                '.header-info', '.profile-card', '.prices-section', '.service-section'
            ];
            let found = false;
            for (const selector of contentSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const el of elements) {
                    // Use regex to match the query, case-insensitive
                    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    if (regex.test(el.textContent)) {
                        // Replace matched text with a span
                        el.innerHTML = el.innerHTML.replace(regex, '<span class="search-mark">$1</span>');
                        el.classList.add('search-highlight');
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
        }
    });

    // Smooth scroll for navbar anchor links
    document.querySelectorAll('.navbar a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').slice(1);
            if (!targetId) return; // skip if href="#"
            const target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Optionally update the URL hash
                history.pushState(null, '', '#' + targetId);
            }
        });
    });
});

// Floating upward animation on scroll for all main sections, and refreshes when scrolled back
function animateOnScroll() {
    const animatedSections = document.querySelectorAll('#home, #prices, #terms');
    animatedSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100 && rect.bottom > 100) {
            section.classList.add('animate-float-up');
        } else {
            section.classList.remove('animate-float-up');
        }
    });
}

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('DOMContentLoaded', animateOnScroll);

// Add highlight style
const style = document.createElement('style');
style.innerHTML = `
.search-highlight {
    outline: 2px solid #b8c6ff;
    background: rgba(120,150,255,0.08);
    transition: background 0.4s, outline 0.4s;
}
`;
document.head.appendChild(style);