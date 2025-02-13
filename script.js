const photoData = {
    1: {
        title: "3 AM Thoughts",
        description: "The quiet desperation of another late-night study session, captured in the soft glow of a desk lamp.",
        stressLevel: 85,
        thoughts: ["Just five more pages...", "I should've started earlier", "Is the sun rising?"]
    },
    2: {
        title: "Coffee & Contemplation",
        description: "A moment of reflection amidst a sea of empty coffee cups and scattered notes.",
        stressLevel: 75,
        thoughts: ["One more cup should do it", "What time is it?", "I can sleep when I'm dead"]
    },
    3: {
        title: "Digital Anxiety",
        description: "A screen showing multiple deadline notifications and unread emails."
    },
    4: {
        title: "Library Haven",
        description: "Students finding solace in the quiet corners of the library during exam season."
    },
    5: {
        title: "Deadline Dance",
        description: "A creative visualization of juggling multiple assignments and responsibilities."
    },
    6: {
        title: "Sleep Deprived",
        description: "The physical toll of constant academic pressure captured in a single moment."
    },
    7: {
        title: "Social Media Escape",
        description: "The ironic comfort of procrastination through social media."
    },
    8: {
        title: "Breaking Point",
        description: "A powerful portrayal of student burnout and mental exhaustion."
    },
    9: {
        title: "Support System",
        description: "Friends helping each other through the stress of academic life."
    },
    10: {
        title: "Light at the End",
        description: "The relief and satisfaction of finally submitting that last assignment."
    }
};

// Add this function near the top of the file
function getNavigationSource() {
    const params = new URLSearchParams(window.location.search);
    return params.get('from') || 'home';
}

// Add this function to handle back navigation
function handleBackNavigation() {
    const source = getNavigationSource();
    return source === 'gallery' ? 'gallery.html' : 'index.html';
}

// Update clock
function updateClock() {
    // Only run clock updates on pages with the status bar
    const statusBar = document.querySelector('.status-bar');
    if (!statusBar) return;

    const timeElement = document.querySelector('.status-bar .time');
    const monthElement = document.querySelector('.month');
    const dayElement = document.querySelector('.day');
    const numberElement = document.querySelector('.number');
    
    // Only proceed with elements that exist
    if (timeElement) {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        timeElement.textContent = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}`;
        
        // Only update date elements if they exist
        if (monthElement && dayElement && numberElement) {
            const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                          'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            monthElement.textContent = months[now.getMonth()];
            dayElement.textContent = days[now.getDay()];
            numberElement.textContent = now.getDate();
        }
    }
}

setInterval(updateClock, 1000);
// Call immediately to avoid initial delay
updateClock();

document.querySelectorAll('.photo-btn').forEach(button => {
    button.addEventListener('click', () => {
        const photoNumber = button.dataset.photo;
        const photo = photoData[photoNumber];
        
        // Add typing effect to description
        document.querySelector('.photo-description').textContent = '';
        typeWriter(document.querySelector('.photo-description'), photo.description, 50);
        
        // Update stress indicators
        document.querySelector('.heart-rate').textContent = `❤️ ${photo.heartRate} BPM`;
        document.querySelector('.coffee-count').textContent = `☕️ × ${photo.coffeeCount}`;
        
        document.querySelector('.photo-title').textContent = photo.title;
    });
});

function typeWriter(element, text, speed) {
    let i = 0;
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
} 