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
    const outputLineNumbers = document.getElementById('outputLineNumbers');

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

    // Update line numbers for input
    function updateInputLineNumbers() {
        const lines = jsonInput.value.split('\n');
        let lineNumbers = '';
        
        for (let i = 0; i < lines.length; i++) {
            lineNumbers += (i + 1) + '<br>';
        }
        
        inputLineNumbers.innerHTML = lineNumbers;
    }

    // Update line numbers for output
    function updateOutputLineNumbers() {
        const lines = jsonOutput.textContent.split('\n');
        let lineNumbers = '';
        
        for (let i = 0; i < lines.length; i++) {
            lineNumbers += (i + 1) + '<br>';
        }
        
        outputLineNumbers.innerHTML = lineNumbers;
    }

    // Initialize line numbers
    updateInputLineNumbers();
    updateOutputLineNumbers();

    // Update character count and line numbers
    jsonInput.addEventListener('input', function() {
        updateInputLineNumbers();
        charCount.textContent = `${jsonInput.value.length} characters`;
    });

    // Observe output changes for line numbers
    const observer = new MutationObserver(function(mutations) {
        updateOutputLineNumbers();
    });

    observer.observe(jsonOutput, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Load sample JSON - FIXED THIS FUNCTION
    sampleBtn.addEventListener('click', function() {
        try {
            jsonInput.value = JSON.stringify(sampleJSON, null, 2);
            charCount.textContent = `${jsonInput.value.length} characters`;
            jsonOutput.textContent = 'Click "Format" or "Minify" to process the JSON';
            updateInputLineNumbers();
            updateOutputLineNumbers();
        } catch (error) {
            console.error("Error loading sample:", error);
        }
    });

    // Clear all
    clearBtn.addEventListener('click', function() {
        jsonInput.value = '';
        jsonOutput.textContent = 'Formatted JSON will appear here...';
        charCount.textContent = '0 characters';
        updateInputLineNumbers();
        updateOutputLineNumbers();
    });

    // Format JSON
    formatBtn.addEventListener('click', function() {
        try {
            const parsedJson = JSON.parse(jsonInput.value);
            const formattedJson = JSON.stringify(parsedJson, null, 4);
            jsonOutput.textContent = formattedJson;
            updateOutputLineNumbers();
        } catch (error) {
            jsonOutput.innerHTML = `<span class="invalid">✗ ${error.message}</span>`;
            updateOutputLineNumbers();
        }
    });

    // Minify JSON
    minifyBtn.addEventListener('click', function() {
        try {
            const parsedJson = JSON.parse(jsonInput.value);
            const minifiedJson = JSON.stringify(parsedJson);
            jsonOutput.textContent = minifiedJson;
            updateOutputLineNumbers();
        } catch (error) {
            jsonOutput.innerHTML = `<span class="invalid">✗ ${error.message}</span>`;
            updateOutputLineNumbers();
        }
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', function() {
        const textToCopy = jsonOutput.textContent;
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
        });
    });
});