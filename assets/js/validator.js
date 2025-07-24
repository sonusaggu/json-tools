document.addEventListener('DOMContentLoaded', function() {
    const jsonInput = document.getElementById('jsonInput');
    const jsonOutput = document.getElementById('jsonOutput');
    const validateBtn = document.getElementById('validateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const errorContainer = document.getElementById('errorContainer');
    const errorList = document.getElementById('errorList');
    const errorCount = document.getElementById('errorCount');
    const charCount = document.getElementById('charCount');
    const lineNumbers = document.getElementById('lineNumbers');

    // Sample JSON data
    const sampleJSON = {
        "name": "JSON Validator Sample",
        "description": "This is a sample JSON for validation",
        "version": "1.0",
        "metadata": {
            "created": "2023-01-01",
            "modified": "2023-01-15"
        },
        "tags": ["json", "validator", "sample"],
        "active": true,
        "count": 42
    };

    // Update line numbers
    function updateLineNumbers() {
        const lines = jsonInput.value.split('\n');
        let lineNumbersHTML = '';
        
        for (let i = 0; i < lines.length; i++) {
            lineNumbersHTML += (i + 1) + '<br>';
        }
        
        lineNumbers.innerHTML = lineNumbersHTML;
    }

    // Initialize line numbers
    updateLineNumbers();

    // Update character count and line numbers
    jsonInput.addEventListener('input', function() {
        updateLineNumbers();
        charCount.textContent = `${jsonInput.value.length} characters`;
    });

    // Load sample JSON
    sampleBtn.addEventListener('click', function() {
        jsonInput.value = JSON.stringify(sampleJSON, null, 2);
        charCount.textContent = `${jsonInput.value.length} characters`;
        jsonOutput.textContent = 'Click "Validate" to check the JSON';
        errorContainer.classList.remove('visible');
        updateLineNumbers();
    });

    // Clear all
    clearBtn.addEventListener('click', function() {
        jsonInput.value = '';
        jsonOutput.textContent = 'Validation results will appear here...';
        errorContainer.classList.remove('visible');
        charCount.textContent = '0 characters';
        updateLineNumbers();
    });

    // Validate JSON
    validateBtn.addEventListener('click', function() {
        try {
            JSON.parse(jsonInput.value);
            jsonOutput.innerHTML = '<span class="valid">✓ Valid JSON</span>';
            errorContainer.classList.remove('visible');
        } catch (error) {
            displayError(error);
        }
    });

    // Display error details
    function displayError(error) {
        jsonOutput.innerHTML = '<span class="invalid">✗ Invalid JSON</span>';
        
        // Parse error message to get position
        const match = error.message.match(/position (\d+)/);
        const errorPosition = match ? parseInt(match[1]) : null;
        
        // Create error item
        const errorItem = document.createElement('div');
        errorItem.className = 'error-item';
        
        if (errorPosition !== null) {
            // Find the line and column
            const textUpToError = jsonInput.value.substring(0, errorPosition);
            const lines = textUpToError.split('\n');
            const line = lines.length;
            const column = lines[lines.length - 1].length + 1;
            
            errorItem.innerHTML = `
                <span class="error-position">Line ${line}, Column ${column}:</span>
                <span class="error-message">${error.message}</span>
            `;
        } else {
            errorItem.innerHTML = `
                <span class="error-message">${error.message}</span>
            `;
        }
        
        errorList.innerHTML = '';
        errorList.appendChild(errorItem);
        errorCount.textContent = '1 error';
        errorContainer.classList.add('visible');
        
        // Scroll to the error position in the input
        if (errorPosition !== null) {
            jsonInput.focus();
            jsonInput.setSelectionRange(errorPosition, errorPosition);
            
            // Highlight the line with error
            const lineNumbersElements = lineNumbers.querySelectorAll('br');
            if (lineNumbersElements.length > 0) {
                // Remove previous highlights
                lineNumbersElements.forEach(br => {
                    if (br.previousSibling && br.previousSibling.classList) {
                        br.previousSibling.classList.remove('error-line');
                    }
                });
                
                // Highlight the error line
                const errorLine = lines.length - 1;
                if (lineNumbersElements[errorLine] && lineNumbersElements[errorLine].previousSibling) {
                    lineNumbersElements[errorLine].previousSibling.classList.add('error-line');
                }
            }
        }
    }
});