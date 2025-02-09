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
        // Wait for Commento to load
        if (typeof window.commento === 'undefined') {
            setTimeout(initCommento, 100);
            return;
        }
        
        // Initialize Commento in the hidden div
        window.commento.main();
    }

    initCommento();

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

        // Get the comment box from Commento
        const commentBox = document.querySelector('#commento textarea');
        if (!commentBox) {
            alert('Comment system is still loading. Please try again in a moment.');
            return;
        }

        // Set the comment text and trigger Commento's submit
        commentBox.value = tempDiv.textContent;
        const submitButton = document.querySelector('#commento .commento-submit-button');
        if (submitButton) {
            // Set the name in Commento's name field if it exists
            const commentoNameInput = document.querySelector('#commento input[name="commento-name"]');
            if (commentoNameInput) {
                commentoNameInput.value = nameInput.value;
            }
            
            submitButton.click();
            
            // Clear our form
            nameInput.value = '';
            editorDiv.innerHTML = '';
        }
    });

    // Handle cancel button
    document.querySelector('.cancel').addEventListener('click', function() {
        document.getElementById('name').value = '';
        editorDiv.innerHTML = '';
    });

    // Observer to sync Commento comments with our UI
    const commentsObserver = new MutationObserver(function(mutations) {
        const commentoCards = document.querySelectorAll('#commento .commento-card');
        const commentsSection = document.querySelector('.comments-section');
        
        if (!commentsSection) return;
        
        // Clear existing comments
        commentsSection.innerHTML = '';
        
        // Convert Commento comments to our UI format
        commentoCards.forEach(card => {
            try {
                const name = card.querySelector('.commento-name')?.textContent || 'Anonymous';
                const body = card.querySelector('.commento-body')?.textContent || '';
                const time = card.querySelector('.commento-timeago')?.textContent || '';
                
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
                console.error('Error processing comment:', error);
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