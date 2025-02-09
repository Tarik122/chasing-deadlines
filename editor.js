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

    // Add form submission handler
    document.querySelector('.add-entry').addEventListener('click', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const commentText = editorDiv.innerHTML;
        
        if (!nameInput.value.trim() || !commentText.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        // Call Commento's API to submit the comment
        window.commento.comment(commentText, null, function(error) {
            if (error) {
                console.error('Error posting comment:', error);
                alert('Error posting comment. Please try again.');
                return;
            }
            
            // Clear the form
            nameInput.value = '';
            editorDiv.innerHTML = '';
            
            // Refresh comments
            window.commento.main();
        });
    });

    // Handle cancel button
    document.querySelector('.cancel').addEventListener('click', function() {
        document.getElementById('name').value = '';
        editorDiv.innerHTML = '';
    });
}); 