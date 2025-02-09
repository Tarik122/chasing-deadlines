document.addEventListener('DOMContentLoaded', function() {
    // Move getCurrentPhotoNumber to the top level
    function getCurrentPhotoNumber() {
        // First check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const photoParam = urlParams.get('photo');
        if (photoParam) {
            return photoParam;
        }
        
        // Fallback to checking pathname
        const path = window.location.pathname;
        const match = path.match(/photo(\d+)\.html/);
        return match ? match[1] : null;
    }

    // Add back button handler right at the start
    const backButton = document.querySelector('.photo-header .back-button');
    if (backButton) {
        const photoNumber = getCurrentPhotoNumber();
        if (photoNumber) {
            backButton.href = `photo${photoNumber}.html`;
        } else {
            backButton.href = 'index.html';
        }
    }

    const textarea = document.getElementById('body');
    
    // Format selected text using execCommand
    function formatText(command, value = null) {
        editorDiv.focus();
        document.execCommand(command, false, value);
        updateButtonStates();
    }

    // Update button active states
    function updateButtonStates() {
        document.getElementById('boldBtn').classList.toggle('active', document.queryCommandState('bold'));
        document.getElementById('italicBtn').classList.toggle('active', document.queryCommandState('italic'));
        document.getElementById('strikeBtn').classList.toggle('active', document.queryCommandState('strikethrough'));
        document.getElementById('underlineBtn').classList.toggle('active', document.queryCommandState('underline'));
    }

    // Convert textarea to contenteditable div
    const editorDiv = document.createElement('div');
    editorDiv.setAttribute('contenteditable', 'true');
    editorDiv.setAttribute('id', 'editor');
    editorDiv.classList.add('editor-content');
    textarea.parentNode.replaceChild(editorDiv, textarea);

    // Button click handlers with preventDefault
    const buttons = document.querySelectorAll('.editor-toolbar button');
    buttons.forEach(button => {
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
    });

    document.getElementById('boldBtn').addEventListener('click', () => formatText('bold'));
    document.getElementById('italicBtn').addEventListener('click', () => formatText('italic'));
    document.getElementById('strikeBtn').addEventListener('click', () => formatText('strikethrough'));
    document.getElementById('underlineBtn').addEventListener('click', () => formatText('underline'));

    // Monitor selection changes to update button states
    editorDiv.addEventListener('keyup', updateButtonStates);
    editorDiv.addEventListener('mouseup', updateButtonStates);
    editorDiv.addEventListener('selectionchange', updateButtonStates);

    // Initialize Commento
    function initCommento() {
        // Wait for Commento script to load
        if (typeof window.commento === 'undefined') {
            console.log('Waiting for Commento to load...');
            setTimeout(initCommento, 100);
            return;
        }
        
        try {
            // Initialize Commento in the hidden div
            window.commento.main();
            console.log('Commento initialized successfully');
            
            // Verify Commento elements are created
            setTimeout(() => {
                const commentBox = document.querySelector('#commento textarea');
                const submitButton = document.querySelector('#commento .commento-submit-button');
                const nameField = document.querySelector('#commento input[name="commento-name"]');
                
                console.log('Commento elements check:', {
                    commentBox: !!commentBox,
                    submitButton: !!submitButton,
                    nameField: !!nameField
                });
            }, 1000);

            // Handle back button navigation
            const backButton = document.querySelector('.photo-header .back-button');
            if (backButton) {
                const photoNumber = getCurrentPhotoNumber();
                if (photoNumber) {
                    backButton.href = `photo${photoNumber}.html`;
                } else {
                    backButton.href = 'index.html';
                }
            }
        } catch (error) {
            console.error('Error initializing Commento:', error);
            setTimeout(initCommento, 100);
        }
    }

    // Start initialization after DOM is ready
    initCommento();

    // Add this function at the top level of your DOMContentLoaded callback
    function setCommentoName(name) {
        window.commentoCommenterName = name;
        // Try multiple ways to set the name
        if (window.commento) {
            window.commento.commenterName = name;
            if (typeof window.commento.setConfig === 'function') {
                window.commento.setConfig({ commenterName: name });
            }
        }
        localStorage.setItem('commento-commenter-name', name);
    }

    // Add form submission handler
    document.querySelector('.add-entry').addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Add Entry button clicked');
        
        const nameInput = document.getElementById('name');
        const commentText = editorDiv.innerHTML;
        
        if (!nameInput.value.trim() || !commentText.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        console.log('Form data:', {
            name: nameInput.value,
            comment: commentText
        });

        // Create a temporary div to hold the comment HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = commentText;

        // Function to find Commento elements
        function findCommentoElements() {
            const elements = {
                commentBox: document.querySelector('#commento textarea'),
                submitButton: document.querySelector('#commento .commento-submit-button'),
                nameField: document.querySelector('#commento input[name="name"]') ||
                          document.querySelector('#commento .commento-input-name') ||
                          document.querySelector('#commento input.commento-name')
            };
            
            console.log('Found Commento elements:', elements);
            return elements;
        }

        // Function to submit comment
        function submitComment() {
            const elements = findCommentoElements();
            
            if (!elements.commentBox || !elements.submitButton) {
                console.log('Essential Commento elements not ready, reinitializing...');
                window.commento.main();
                setTimeout(submitComment, 500);
                return;
            }

            try {
                // Get photo information
                const photoNumber = getCurrentPhotoNumber();
                const photoTitle = photoData[photoNumber]?.title || 'Unknown Photo';

                // Create a comment object with metadata
                const commentData = {
                    name: nameInput.value,
                    body: tempDiv.textContent.trim(),
                    timestamp: new Date().toISOString(),
                    photo: {
                        number: photoNumber,
                        title: photoTitle
                    }
                };

                // Convert to JSON and store in Commento's comment box
                elements.commentBox.value = JSON.stringify(commentData);
                elements.commentBox.dispatchEvent(new Event('input', { bubbles: true }));

                console.log('Submitting comment with data:', commentData);
                elements.submitButton.click();
                
                // Clear our form
                nameInput.value = '';
                editorDiv.innerHTML = '';
                
                console.log('Form submitted and cleared');
            } catch (error) {
                console.error('Error during comment submission:', error);
                alert('Error submitting comment. Please try again.');
            }
        }

        // Start the submission process
        submitComment();
    });

    // Handle cancel button
    document.querySelector('.cancel').addEventListener('click', function() {
        document.getElementById('name').value = '';
        editorDiv.innerHTML = '';
    });

    // Observer to sync Commento comments with our UI
    const commentsObserver = new MutationObserver(function(mutations) {
        console.log('Mutation observed:', mutations);
        
        const commentoCards = document.querySelectorAll('#commento .commento-card');
        console.log('Found comment cards:', commentoCards.length);
        
        const commentsSection = document.querySelector('.comments-section');
        if (!commentsSection) {
            console.log('Comments section not found');
            return;
        }
        
        // Clear existing comments
        commentsSection.innerHTML = '';
        
        // Convert Commento comments to our UI format
        commentoCards.forEach((card, index) => {
            try {
                const commentText = card.querySelector('.commento-body')?.textContent || '';
                let name = 'Anonymous';
                let body = commentText;
                let time = card.querySelector('.commento-timeago')?.textContent || '';
                let photoInfo = '';

                // Try to parse the comment as JSON
                try {
                    const commentData = JSON.parse(commentText);
                    name = commentData.name || 'Anonymous';
                    body = commentData.body || '';
                    
                    // Add photo information if available
                    if (commentData.photo) {
                        photoInfo = `<span class="time-separator">•</span><a href="discussions.html?photo=${commentData.photo.number}" class="comment-photo-link">Photo ${commentData.photo.number}</a>`;
                    }

                    // Use the stored timestamp if available
                    if (commentData.timestamp) {
                        const date = new Date(commentData.timestamp);
                        const now = new Date();
                        const diffMinutes = Math.floor((now - date) / 1000 / 60);
                        
                        if (diffMinutes < 1) time = 'just now';
                        else if (diffMinutes < 60) time = `${diffMinutes} minutes ago`;
                        else if (diffMinutes < 1440) time = `${Math.floor(diffMinutes/60)} hours ago`;
                        else time = `${Math.floor(diffMinutes/1440)} days ago`;
                    }
                } catch (e) {
                    // If not JSON, use the comment text as-is
                    body = commentText;
                }
                
                console.log(`Processing comment ${index}:`, { name, body, time, photoInfo });
                
                const commentHTML = `
                    <div class="comment">
                        <div class="comment-header">
                            <img src="ManageBac Icon Set/02-Learner Profile/Reflective.png" alt="" class="user-icon">
                            <div class="comment-meta">
                                <div class="commenter-name">${name}</div>
                                <div class="comment-time">
                                    ${time}${photoInfo}
                                </div>
                            </div>
                            <button class="more-options">⋮</button>
                        </div>
                        <div class="comment-body">${body}</div>
                    </div>
                `;
                
                commentsSection.insertAdjacentHTML('beforeend', commentHTML);
            } catch (error) {
                console.error(`Error processing comment ${index}:`, error);
            }
        });
    });

    // Start observing once Commento is loaded
    const startObserver = () => {
        const commentoDiv = document.getElementById('commento');
        if (commentoDiv) {
            commentsObserver.observe(commentoDiv, {
                childList: true,
                subtree: true
            });
        } else {
            setTimeout(startObserver, 100);
        }
    };

    startObserver();
}); 