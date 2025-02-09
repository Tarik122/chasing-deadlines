document.addEventListener('DOMContentLoaded', function() {
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
            setTimeout(initCommento, 100);
            return;
        }
        
        try {
            // Initialize Commento in the hidden div
            window.commento.main();
            console.log('Commento initialized successfully');
        } catch (error) {
            console.error('Error initializing Commento:', error);
            setTimeout(initCommento, 100);
        }
    }

    // Start initialization after a short delay to ensure DOM is ready
    setTimeout(initCommento, 500);

    // Add form submission handler
    document.querySelector('.add-entry').addEventListener('click', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const commentText = editorDiv.innerHTML;
        
        if (!nameInput.value.trim() || !commentText.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        // Create a temporary div to hold the comment HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = commentText;

        // Wait for Commento to be fully loaded
        function submitComment() {
            const commentoRoot = document.querySelector('#commento');
            const commentBox = document.querySelector('#commento textarea');
            const submitButton = document.querySelector('#commento .commento-submit-button');
            const nameField = document.querySelector('#commento input[name="commento-name"]');

            console.log('Commento elements:', {
                root: commentoRoot,
                commentBox: commentBox,
                submitButton: submitButton,
                nameField: nameField
            });

            if (!commentBox || !submitButton || !nameField) {
                console.log('Waiting for Commento elements to load...');
                setTimeout(submitComment, 100);
                return;
            }

            try {
                // Set the values
                nameField.value = nameInput.value;
                commentBox.value = tempDiv.textContent;
                console.log('Values set:', {
                    name: nameField.value,
                    comment: commentBox.value
                });

                // Trigger events to ensure Commento recognizes the input
                nameField.dispatchEvent(new Event('input'));
                commentBox.dispatchEvent(new Event('input'));

                // Trigger the submit
                console.log('Clicking submit button...');
                submitButton.click();
                
                // Clear our form
                nameInput.value = '';
                editorDiv.innerHTML = '';
                
                console.log('Form submitted and cleared');
            } catch (error) {
                console.error('Error during comment submission:', error);
                alert('Error submitting comment. Please try again.');
            }
        }

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
                const name = card.querySelector('.commento-name')?.textContent || 'Anonymous';
                const body = card.querySelector('.commento-body')?.textContent || '';
                const time = card.querySelector('.commento-timeago')?.textContent || '';
                
                console.log(`Processing comment ${index}:`, { name, body, time });
                
                const commentHTML = `
                    <div class="comment">
                        <div class="comment-header">
                            <img src="ManageBac Icon Set/02-Learner Profile/Reflective.png" alt="" class="user-icon">
                            <div class="comment-meta">
                                <div class="commenter-name">${name}</div>
                                <div class="comment-time">${time}</div>
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