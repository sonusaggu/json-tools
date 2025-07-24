document.addEventListener('DOMContentLoaded', function () {
    const jsonInput = document.getElementById('json-input');
    const jsonOutput = document.getElementById('json-output');
    const stringifyBtn = document.getElementById('stringify-btn');
    const downloadBtn = document.getElementById('download-json');
    const copyBtn = document.getElementById('copy-json');
    const prettyPrint = document.getElementById('pretty-print');
    const indentInput = document.getElementById('indent');
    const sampleBtn = document.getElementById('sample-data');
    const clearBtn = document.getElementById('clear-input');
    const lineNumbers = document.querySelector('.line-numbers');
    const inputCharCount = document.getElementById('input-char-count');
    const outputCharCount = document.getElementById('output-char-count');
    const inputStatus = document.getElementById('input-status');
    const outputStatus = document.getElementById('output-status');

    const sampleData = {
        id: 1,
        name: "Sample Object",
        active: true,
        values: [1, 2, 3],
        nested: {
            key: "value",
            empty: null
        },
        date: new Date().toISOString()
    };

    if (sampleBtn) {
        sampleBtn.addEventListener('click', () => {
            jsonInput.value = JSON.stringify(sampleData, null, 2);
            updateLineNumbers();
            updateCharCount();
            validateInput();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            jsonInput.value = '';
            jsonOutput.textContent = 'Stringified JSON will appear here...';
            updateLineNumbers();
            updateCharCount();
            inputStatus.textContent = 'Valid JSON';
            inputStatus.className = 'status-indicator';
        });
    }

    function updateLineNumbers() {
        if (!lineNumbers) return;
        const lines = jsonInput.value.split('\n');
        lineNumbers.innerHTML = lines.map((_, i) => (i + 1)).join('<br>');
        
        // Sync the scroll positions
        lineNumbers.scrollTop = jsonInput.scrollTop;
    }

    // Add scroll event listener to sync line numbers with textarea
    jsonInput?.addEventListener('scroll', () => {
        if (lineNumbers) {
            lineNumbers.scrollTop = jsonInput.scrollTop;
        }
    });

    function updateCharCount() {
        if (inputCharCount) {
            inputCharCount.textContent = `${jsonInput.value.length} characters`;
        }
        if (outputCharCount) {
            outputCharCount.textContent = `${jsonOutput.textContent.length} characters`;
        }
    }

    function validateInput() {
        try {
            if (jsonInput.value.trim() === '') {
                inputStatus.textContent = 'Empty';
                inputStatus.className = 'status-indicator';
                return;
            }
            JSON.parse(jsonInput.value);
            inputStatus.textContent = 'Valid JSON';
            inputStatus.className = 'status-indicator success';
        } catch (error) {
            inputStatus.textContent = `Invalid JSON: ${error.message}`;
            inputStatus.className = 'status-indicator error';
        }
    }

    function parseIndent(value) {
        if (value === "\\t") return "\t";
        const num = parseInt(value, 10);
        return isNaN(num) ? 2 : num;
    }

    function stringifyJSON(jsonData, pretty = true, indentValue = 2) {
        try {
            const obj = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            if (pretty) {
                // For pretty print, return formatted JSON
                return JSON.stringify(obj, null, indentValue);
            } else {
                // For compact output, return minified JSON string
                return JSON.stringify(obj);
            }
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }

    stringifyBtn?.addEventListener('click', () => {
        const indentValue = parseIndent(indentInput?.value || "2");
        const result = stringifyJSON(jsonInput.value, prettyPrint.checked, indentValue);
        
        jsonOutput.textContent = result;
        outputStatus.textContent = 'Stringified successfully';
        outputStatus.className = 'status-indicator success';
        updateCharCount();
    });

    downloadBtn?.addEventListener('click', () => {
        const json = jsonOutput.textContent;
        if (!json || json.startsWith('Error:')) return;

        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        outputStatus.textContent = 'File downloaded';
        outputStatus.className = 'status-indicator success';
    });

    copyBtn?.addEventListener('click', () => {
        const json = jsonOutput.textContent;
        if (!json || json.startsWith('Error:')) return;

        navigator.clipboard.writeText(json).then(() => {
            const icon = copyBtn.querySelector('i');
            if (icon) {
                icon.classList.replace('far', 'fas');
                setTimeout(() => icon.classList.replace('fas', 'far'), 2000);
            }
            outputStatus.textContent = 'Copied to clipboard';
            outputStatus.className = 'status-indicator success';
        }).catch(err => {
            outputStatus.textContent = 'Copy failed: ' + err.message;
            outputStatus.className = 'status-indicator error';
        });
    });

    jsonInput?.addEventListener('input', () => {
        updateLineNumbers();
        updateCharCount();
        validateInput();
    });
    
    // Initialize
    updateLineNumbers();
    updateCharCount();
    validateInput();
});