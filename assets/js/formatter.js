document.addEventListener('DOMContentLoaded', function() {
    // Get all elements
    const jsonInput = document.getElementById('jsonInput');
    const jsonOutput = document.getElementById('jsonOutput');
    const formatBtn = document.getElementById('formatBtn');
    const minifyBtn = document.getElementById('minifyBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const charCount = document.getElementById('charCount');
    const inputLineNumbers = document.getElementById('inputLineNumbers');

    // Sample JSON data
    const sampleJSON = {
        "formatted": true,
        "purpose": "Demonstrate JSON formatting",
        "features": ["indentation", "syntax highlighting", "readability"],
        "details": {
            "indentSize": 4,
            "maxLineLength": 80,
            "compact": false
        },
        "stats": {
            "lines": 15,
            "bytes": 256,
            "complexity": "medium"
        }
    };

    // Initialize editor
    function initEditor() {
        // Set initial padding for line numbers
        jsonInput.style.paddingLeft = '60px';
        
        // Initialize line numbers
        updateInputLineNumbers();
        
        // Set up scroll synchronization
        jsonInput.addEventListener('scroll', syncScroll);
    }

    // Update line numbers for input
    function updateInputLineNumbers() {
        const lines = jsonInput.value.split('\n');
        let lineNumbersHTML = '';
        
        for (let i = 0; i < lines.length; i++) {
            lineNumbersHTML += (i + 1) + '<br>';
        }
        
        inputLineNumbers.innerHTML = lineNumbersHTML;
        syncScroll();
    }

    // Synchronize scrolling between textarea and line numbers
    function syncScroll() {
        inputLineNumbers.scrollTop = jsonInput.scrollTop;
    }

    // Initialize the editor
    initEditor();

    // Update character count and line numbers on input
    jsonInput.addEventListener('input', function() {
        updateInputLineNumbers();
        charCount.textContent = `${jsonInput.value.length} characters`;
    });

    // Load sample JSON - FIXED VERSION
    sampleBtn.addEventListener('click', function() {
        try {
            const formattedJSON = JSON.stringify(sampleJSON, null, 2);
            jsonInput.value = formattedJSON;
            charCount.textContent = `${formattedJSON.length} characters`;
            jsonOutput.textContent = 'Click "Format" or "Minify" to process the JSON';
            updateInputLineNumbers();
            
            // Reset scroll position
            jsonInput.scrollTop = 0;
            syncScroll();
        } catch (error) {
            console.error("Error loading sample:", error);
            jsonOutput.innerHTML = `<span class="invalid">✗ Error loading sample: ${error.message}</span>`;
        }
    });

    // Clear all
    clearBtn.addEventListener('click', function() {
        jsonInput.value = '';
        jsonOutput.textContent = 'Formatted JSON will appear here...';
        charCount.textContent = '0 characters';
        updateInputLineNumbers();
    });

    // Format JSON with proper error handling
    formatBtn.addEventListener('click', function() {
        try {
            if (!jsonInput.value.trim()) {
                throw new Error("Input is empty");
            }
            
            const parsedJson = JSON.parse(jsonInput.value);
            const formattedJson = JSON.stringify(parsedJson, null, 4);
            jsonOutput.textContent = formattedJson;
        } catch (error) {
            jsonOutput.innerHTML = `<span class="invalid">✗ ${error.message}</span>`;
        }
    });

    // Minify JSON with proper error handling
    minifyBtn.addEventListener('click', function() {
        try {
            if (!jsonInput.value.trim()) {
                throw new Error("Input is empty");
            }
            
            const parsedJson = JSON.parse(jsonInput.value);
            const minifiedJson = JSON.stringify(parsedJson);
            jsonOutput.textContent = minifiedJson;
        } catch (error) {
            jsonOutput.innerHTML = `<span class="invalid">✗ ${error.message}</span>`;
        }
    });

    // Copy to clipboard with visual feedback
    copyBtn.addEventListener('click', function() {
        const textToCopy = jsonOutput.textContent;
        
        // Don't copy if output is just placeholder text
        if (textToCopy === 'Formatted JSON will appear here...' || 
            textToCopy === 'Click "Format" or "Minify" to process the JSON') {
            return;
        }
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            const icon = copyBtn.querySelector('i');
            icon.classList.remove('far', 'fa-copy');
            icon.classList.add('fas', 'fa-check');
            
            setTimeout(() => {
                icon.classList.remove('fas', 'fa-check');
                icon.classList.add('far', 'fa-copy');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            jsonOutput.innerHTML = `<span class="invalid">✗ Failed to copy to clipboard</span>`;
        });
    });

    // Handle window resize to maintain proper layout
    window.addEventListener('resize', function() {
        syncScroll();
    });
});