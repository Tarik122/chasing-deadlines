document.addEventListener('DOMContentLoaded', () => {
    const content = document.querySelector('.content');
    
    // Create photo grid container
    const photoGrid = document.createElement('div');
    photoGrid.className = 'photo-grid';
    
    // Create array of numbers 1-9 and shuffle it
    const photoIndices = Array.from({length: 9}, (_, i) => i + 1);
    for (let i = photoIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [photoIndices[i], photoIndices[j]] = [photoIndices[j], photoIndices[i]];
    }
    
    // Generate photo items in random order
    photoIndices.forEach(i => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        const img = document.createElement('img');
        img.src = `Images/${i}.jpg`;
        img.alt = `Photo ${i}`;
        
        // Add click handler
        photoItem.addEventListener('click', () => {
            window.location.href = `photo${i}.html?from=gallery`;
        });
        
        photoItem.appendChild(img);
        photoGrid.appendChild(photoItem);
    });
    
    content.appendChild(photoGrid);
});
