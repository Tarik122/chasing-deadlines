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
});

// Add this function to help debug API calls
async function debugApiCall(url, options) {
    try {
        const start = Date.now();
        const response = await fetch(url, options);
        const duration = Date.now() - start;
        
        console.log(`API Call to ${url} (${duration}ms):`, {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body: await response.text().catch(() => 'Unable to parse response')
        });

        return response;
    } catch (error) {
        console.error(`API Call to ${url} failed:`, error);
        throw error;
    }
}

// Update the submit handler
document.querySelector('.add-entry').addEventListener('click', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const body = document.getElementById('editor').textContent; // Use text instead of HTML
    
    if (!body.trim()) {
        alert('Please enter some content before submitting!');
        return;
    }

    try {
        const response = await debugApiCall('https://cusdis.com/api/v2/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.CUSDIS.appId}`
            },
            body: JSON.stringify({
                content: body,
                by_nick: name || 'Anonymous',
                pageId: window.CUSDIS.pageId,
                pageUrl: window.CUSDIS.pageUrl,
                pageTitle: window.CUSDIS.pageTitle,
                status: 'approved'
            })
        });

        const result = await response.json();
        console.log('Submission result:', result);

        if (!response.ok) {
            throw new Error(result.message || `HTTP error ${response.status}`);
        }

        // Clear fields and reload
        document.getElementById('name').value = '';
        document.getElementById('editor').innerHTML = '';
        await loadCusdisComments();

    } catch (error) {
        console.error('Submission failed:', error);
        alert(`Submission failed: ${error.message}\nCheck console for details.`);
    }
});

// Update the comments loader
async function loadCusdisComments() {
    try {
        const response = await debugApiCall(
            `https://cusdis.com/api/v2/comments?pageId=${encodeURIComponent(window.CUSDIS.pageId)}&withUser=true`,
            {
                headers: {
                    'Authorization': `Bearer ${window.CUSDIS.appId}`
                }
            }
        );

        const rawData = await response.text();
        const result = JSON.parse(rawData); // Handle non-JSON responses
        console.log('Comments API result:', result);

        if (!response.ok) {
            throw new Error(result.error?.message || `HTTP ${response.status} Error`);
        }

        const commentsSection = document.querySelector('.comments-section');
        commentsSection.innerHTML = '';

        if (!result.data?.length) {
            commentsSection.innerHTML = '<div class="comment">No comments yet. Be the first to add one!</div>';
            return;
        }

        result.data.forEach(comment => {
            const commentHtml = `
                <div class="comment">
                    <div class="comment-header">
                        <div class="user-icon">${(comment.by_nick || '?')[0].toUpperCase()}</div>
                        <div class="comment-meta">
                            <div class="commenter-name">${comment.by_nick || 'Anonymous'}</div>
                            <div class="comment-time">${new Date(comment.createdAt).toLocaleString()}</div>
                        </div>
                    </div>
                    <div class="comment-body">${comment.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                </div>
            `;
            commentsSection.insertAdjacentHTML('beforeend', commentHtml);
        });

    } catch (error) {
        console.error('Comments load error:', error);
        document.querySelector('.comments-section').innerHTML = `
            <div class="comment error">
                Error: ${error.message}<br>
                Check console (F12) for details
            </div>
        `;
    }
}

// Load comments when page loads
document.addEventListener('DOMContentLoaded', loadCusdisComments); 