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

// Add to main.js
document.addEventListener('DOMContentLoaded', function() {
    const chatToggle = document.querySelector('.chat-toggle');
    const chatContainer = document.querySelector('.chat-container');
    const closeChat = document.querySelector('.close-chat');
    const chatInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.send-message');
    const chatMessages = document.querySelector('.chat-messages');

    // Initial bot message
    addMessage('Hi! I\'m Raahz Assistant. How can I help you today?', 'bot');

    chatToggle.addEventListener('click', () => {
        chatContainer.classList.add('active');
    });

    closeChat.addEventListener('click', () => {
        chatContainer.classList.remove('active');
    });

    function addMessage(text, sender) {
        const message = document.createElement('div');
        message.classList.add('message', `${sender}-message`);
        message.textContent = text;
        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function searchAndScroll(searchTerm) {
        const contentSelectors = [
            '.header-info', '.profile-card', '.prices-section', '.service-section'
        ];
        let found = false;
        
        for (const selector of contentSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
                const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                if (regex.test(el.textContent)) {
                    // Remove previous highlights
                    document.querySelectorAll('.search-highlight').forEach(el => {
                        el.classList.remove('search-highlight');
                    });
                    document.querySelectorAll('.search-mark').forEach(el => {
                        const parent = el.parentNode;
                        parent.replaceChild(document.createTextNode(el.textContent), el);
                        parent.normalize();
                    });

                    // Add new highlight
                    el.innerHTML = el.innerHTML.replace(regex, '<span class="search-mark">$1</span>');
                    el.classList.add('search-highlight');

                    // Calculate offset for centered scrolling
                    const navHeight = document.querySelector('.navbar').offsetHeight;
                    const elementRect = el.getBoundingClientRect();
                    const absoluteElementTop = elementRect.top + window.pageYOffset;
                    const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);

                    // Smooth scroll with offset
                    window.scrollTo({
                        top: middle,
                        behavior: 'smooth'
                    });

                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        return found;
    }

    function handleUserMessage(text) {
        addMessage(text, 'user');
        
        const lowercaseText = text.toLowerCase();
        let response = '';

        // Remove previous highlights first
        document.querySelectorAll('.search-highlight').forEach(el => {
            el.classList.remove('search-highlight');
        });
        document.querySelectorAll('.search-mark').forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });

        // Enhanced response logic with search and scroll
        if (lowercaseText.includes('price') || lowercaseText.includes('rate')) {
            if (searchAndScroll('price')) {
                response = 'I\'ve scrolled to the Prices section for you. You can find our detailed rates here.';
            } else {
                response = 'You can find our services and rates in the Prices section.';
            }
        } else if (lowercaseText.includes('terms') || lowercaseText.includes('condition')) {
            if (searchAndScroll('terms')) {
                response = 'I\'ve scrolled to the Terms & Conditions section for you.';
            } else {
                response = 'Please check our Terms & Conditions section for important information.';
            }
        } else if (lowercaseText.includes('contact') || lowercaseText.includes('message')) {
            if (searchAndScroll('contact')) {
                response = 'I\'ve highlighted the contact information for you.';
            } else {
                response = 'You can contact Raahz through Facebook, Instagram, Discord, or TikTok.';
            }
        } else if (lowercaseText.includes('hello') || lowercaseText.includes('hi')) {
            response = 'Hello! How can I assist you today?';
        } else {
            // Try to find any matching content
            if (searchAndScroll(text)) {
                response = 'I\'ve found and highlighted the relevant information for you.';
            } else {
                response = 'I\'m here to help! Feel free to ask about our services, prices, or terms and conditions.';
            }
        }

        setTimeout(() => {
            addMessage(response, 'bot');
        }, 500);
    }

    sendButton.addEventListener('click', () => {
        const text = chatInput.value.trim();
        if (text) {
            handleUserMessage(text);
            chatInput.value = '';
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = chatInput.value.trim();
            if (text) {
                handleUserMessage(text);
                chatInput.value = '';
            }
        }
    });

    const resetButton = document.querySelector('.reset-chat');
    
    resetButton.addEventListener('click', () => {
        chatMessages.innerHTML = ''; // Clear all messages
        // Add back the initial greeting
        addMessage('Hi! I\'m Raahz Assistant. How can I help you today?', 'bot');
    });
});

// Add to main.js
document.addEventListener('DOMContentLoaded', function() {
    const bubbles = document.querySelectorAll('.floating-bubble');
    const mainImage = document.querySelector('.pic img');
    
    bubbles.forEach(bubble => {
        let isDragging = false;
        let isEmoting = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        // Initial floating animation from behind main image
        bubble.dataset.originalAnimation = `float-random${Math.floor(Math.random() * 4) + 1} ${12 + Math.random() * 6}s linear infinite`;
        bubble.style.animation = bubble.dataset.originalAnimation;
        bubble.style.left = '45vw';
        bubble.style.top = '50vh';

        function returnToMainImage() {
            if (isEmoting) return;
            
            const imageRect = mainImage.getBoundingClientRect();
            isEmoting = true;
            
            // Position around main image based on bubble number
            let position;
            if (bubble.classList.contains('bubble1')) {
                // Right side
                position = {
                    left: `${imageRect.right + 20}px`,
                    top: `${imageRect.top + imageRect.height/2}px`
                };
            } else if (bubble.classList.contains('bubble2')) {
                // Top side
                position = {
                    left: `${imageRect.left + imageRect.width/2}px`,
                    top: `${imageRect.top - 60}px`
                };
            } else if (bubble.classList.contains('bubble3')) {
                // Left side
                position = {
                    left: `${imageRect.left - 60}px`,
                    top: `${imageRect.top + imageRect.height/2}px`
                };
            } else if (bubble.classList.contains('bubble4')) {
                // Bottom side
                position = {
                    left: `${imageRect.left + imageRect.width/2}px`,
                    top: `${imageRect.bottom + 20}px`
                };
            }
            
            // Apply position
            bubble.style.transition = 'all 0.5s ease-out';
            bubble.style.left = position.left;
            bubble.style.top = position.top;
            
            // Start emote animation
            bubble.style.animation = 'emote-beside 2s ease-in-out infinite';
            
            // Return to floating after 3 seconds
            setTimeout(() => {
                isEmoting = false;
                bubble.style.transition = 'none';
                // Generate new random animation
                bubble.dataset.originalAnimation = `float-random${Math.floor(Math.random() * 4) + 1} ${12 + Math.random() * 6}s linear infinite`;
                bubble.style.animation = bubble.dataset.originalAnimation;
                bubble.style.left = '45vw';
                bubble.style.top = '50vh';
            }, 3000);
        }

        function onClick(e) {
            if (!isDragging && !isEmoting) {
                returnToMainImage();
            }
        }

        bubble.addEventListener('click', onClick);

        function dragStart(e) {
            if (isEmoting) return;
            
            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }

            if (e.target === bubble) {
                isDragging = true;
                bubble.classList.add('dragging');
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();

                if (e.type === "touchmove") {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }

                xOffset = currentX;
                yOffset = currentY;
                bubble.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            }
        }

        function dragEnd() {
            if (isDragging) {
                isDragging = false;
                bubble.classList.remove('dragging');
                returnToMainImage();
            }
        }

        bubble.addEventListener("touchstart", dragStart, { passive: false });
        bubble.addEventListener("touchend", dragEnd);
        bubble.addEventListener("touchmove", drag, { passive: false });
        bubble.addEventListener("mousedown", dragStart);
        bubble.addEventListener("mouseup", dragEnd);
        bubble.addEventListener("mousemove", drag);
        bubble.addEventListener("mouseleave", dragEnd);
    });
});