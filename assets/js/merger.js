document.addEventListener('DOMContentLoaded', function() {
    const mergeBtn = document.getElementById('mergeBtn');
    const addJsonBtn = document.getElementById('addJsonBtn');
    const clearBtn = document.getElementById('clearBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const copyBtn = document.getElementById('copyBtn');
    const mergeStrategy = document.getElementById('mergeStrategy');
    const jsonInputsContainer = document.getElementById('jsonInputsContainer');
    const jsonOutput = document.getElementById('jsonOutput');
    const errorContainer = document.getElementById('errorContainer');
    const errorList = document.getElementById('errorList');
    const outputLineNumbers = document.getElementById('outputLineNumbers');

    // Sample JSON data
    const sampleJSONs = [
        {
            "id": 1,
            "name": "First Object",
            "commonProperty": "Value from first",
            "nested": {
                "a": 1,
                "b": 2
            },
            "array": [1, 2, 3]
        },
        {
            "id": 2,
            "name": "Second Object",
            "commonProperty": "Value from second",
            "nested": {
                "b": 20,
                "c": 30
            },
            "array": [4, 5, 6],
            "additionalProperty": "Only in second"
        }
    ];

    // Add new JSON input field
    function addJsonInput(initialValue = '') {
        const index = document.querySelectorAll('.json-input-wrapper').length;
        const wrapper = document.createElement('div');
        wrapper.className = 'json-input-wrapper';
        wrapper.innerHTML = `
            <div class="editor-header">
                <span>JSON ${index + 1}</span>
                <button class="btn small danger remove-json-btn" data-index="${index}">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
            <div class="editor-wrapper">
                <div class="line-numbers">1</div>
                <textarea class="merger-json-input" placeholder='Paste JSON here' spellcheck="false">${initialValue}</textarea>
            </div>
        `;
        jsonInputsContainer.appendChild(wrapper);
        
        // Add event listener for the new remove button
        wrapper.querySelector('.remove-json-btn').addEventListener('click', function() {
            wrapper.remove();
            // Update indices of remaining inputs
            document.querySelectorAll('.json-input-wrapper').forEach((w, i) => {
                w.querySelector('span').textContent = `JSON ${i + 1}`;
                w.querySelector('.remove-json-btn').setAttribute('data-index', i);
            });
        });
        
        // Add line number functionality
        const textarea = wrapper.querySelector('textarea');
        const lineNumbers = wrapper.querySelector('.line-numbers');
        
        function updateLineNumbers() {
            const lines = textarea.value.split('\n');
            let numbers = '';
            
            for (let i = 0; i < lines.length; i++) {
                numbers += (i + 1) + '<br>';
            }
            
            lineNumbers.innerHTML = numbers;
        }
        
        textarea.addEventListener('input', updateLineNumbers);
        updateLineNumbers();
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

    // Observe output changes for line numbers
    const observer = new MutationObserver(function(mutations) {
        updateOutputLineNumbers();
    });

    observer.observe(jsonOutput, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Add more JSON input
    addJsonBtn.addEventListener('click', function() {
        addJsonInput();
    });

    // Clear all
    clearBtn.addEventListener('click', function() {
        jsonInputsContainer.innerHTML = '';
        jsonOutput.textContent = 'Merged JSON will appear here...';
        errorContainer.classList.remove('visible');
        // Add back 2 empty inputs
        addJsonInput();
        addJsonInput();
    });

    // Load sample JSONs
    sampleBtn.addEventListener('click', function() {
        jsonInputsContainer.innerHTML = '';
        sampleJSONs.forEach(json => {
            addJsonInput(JSON.stringify(json, null, 2));
        });
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', function() {
        const textToCopy = jsonOutput.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const icon = copyBtn.querySelector('i');
            icon.classList.replace('far', 'fas');
            setTimeout(() => icon.classList.replace('fas', 'far'), 2000);
        });
    });

    // Merge JSONs
    mergeBtn.addEventListener('click', function() {
        const inputs = document.querySelectorAll('.merger-json-input');
        const jsons = [];
        const errors = [];
        
        // Parse all JSON inputs
        inputs.forEach((input, index) => {
            try {
                if (input.value.trim()) {
                    jsons.push(JSON.parse(input.value));
                }
            } catch (error) {
                errors.push({
                    index: index + 1,
                    error: error
                });
            }
        });
        
        // Show parsing errors if any
        if (errors.length > 0) {
            errorList.innerHTML = '';
            errors.forEach(err => {
                const errorItem = document.createElement('div');
                errorItem.className = 'error-item';
                errorItem.innerHTML = `
                    <span class="error-position">JSON ${err.index}:</span>
                    <span class="error-message">${err.error.message}</span>
                `;
                errorList.appendChild(errorItem);
            });
            errorContainer.classList.add('visible');
            jsonOutput.textContent = 'Fix JSON errors before merging';
            return;
        }
        
        if (jsons.length < 2) {
            jsonOutput.textContent = 'At least 2 valid JSON inputs are required for merging';
            errorContainer.classList.remove('visible');
            return;
        }
        
        // Clear previous errors
        errorContainer.classList.remove('visible');
        
        // Perform merge based on selected strategy
        const strategy = mergeStrategy.value;
        let merged;
        const conflicts = [];
        
        try {
            switch (strategy) {
                case 'deep':
                    merged = deepMerge(jsons, conflicts);
                    break;
                case 'shallow':
                    merged = Object.assign({}, ...jsons);
                    break;
                case 'concat':
                    merged = concatMerge(jsons, conflicts);
                    break;
                case 'replace':
                    merged = replaceMerge(jsons);
                    break;
                default:
                    merged = deepMerge(jsons, conflicts);
            }
            
            // Display merged result
            jsonOutput.textContent = JSON.stringify(merged, null, 4);
            
            // Display conflicts if any
            if (conflicts.length > 0) {
                errorList.innerHTML = '';
                conflicts.forEach(conflict => {
                    const conflictItem = document.createElement('div');
                    conflictItem.className = 'conflict-item';
                    
                    const valuesHtml = conflict.values.map((v, i) => 
                        `<div class="conflict-value">JSON ${i + 1}: ${JSON.stringify(v)}</div>`
                    ).join('');
                    
                    conflictItem.innerHTML = `
                        <div class="conflict-key">Conflict at "${conflict.key}"</div>
                        <div class="conflict-values">${valuesHtml}</div>
                        <div>Resolved with: ${conflict.resolved}</div>
                    `;
                    
                    errorList.appendChild(conflictItem);
                });
                
                errorContainer.classList.add('visible');
            }
        } catch (error) {
            jsonOutput.innerHTML = `<span class="invalid">✗ Merge failed: ${error.message}</span>`;
        }
    });

    // Deep merge implementation with conflict tracking
    function deepMerge(objects, conflicts = [], path = '') {
        const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
        
        return objects.reduce((acc, current, index) => {
            if (!current) return acc;
            
            Object.keys(current).forEach(key => {
                const currentPath = path ? `${path}.${key}` : key;
                
                if (acc.hasOwnProperty(key)) {
                    // Conflict detected
                    if (isObject(acc[key]) && isObject(current[key])) {
                        // Both are objects, merge recursively
                        acc[key] = deepMerge([acc[key], current[key]], conflicts, currentPath);
                    } else if (Array.isArray(acc[key]) && Array.isArray(current[key])) {
                        // Both are arrays
                        if (mergeStrategy.value === 'concat') {
                            acc[key] = [...acc[key], ...current[key]];
                        } else {
                            // For other strategies, just take the latter
                            acc[key] = current[key];
                            conflicts.push({
                                key: currentPath,
                                values: [acc[key], current[key]],
                                resolved: 'used latter value'
                            });
                        }
                    } else {
                        // Primitive values or different types
                        if (JSON.stringify(acc[key]) !== JSON.stringify(current[key])) {
                            conflicts.push({
                                key: currentPath,
                                values: objects.map(obj => obj ? obj[key] : undefined),
                                resolved: 'used latter value'
                            });
                        }
                        acc[key] = current[key];
                    }
                } else {
                    // No conflict, just add the property
                    acc[key] = current[key];
                }
            });
            
            return acc;
        }, {});
    }

    // Concatenate arrays merge implementation
    function concatMerge(objects, conflicts = []) {
        const isObject = obj => obj && typeof obj === 'object';
        const isArray = obj => Array.isArray(obj);
        
        return objects.reduce((acc, current) => {
            if (!current) return acc;
            
            Object.keys(current).forEach(key => {
                if (acc.hasOwnProperty(key)) {
                    // Conflict detected
                    if (isObject(acc[key]) && isObject(current[key]) && !isArray(acc[key]) && !isArray(current[key])) {
                        // Both are objects (not arrays), merge recursively
                        acc[key] = concatMerge([acc[key], current[key]], conflicts);
                    } else if (isArray(acc[key]) && isArray(current[key])) {
                        // Both are arrays, concatenate
                        acc[key] = [...acc[key], ...current[key]];
                    } else {
                        // Different types or one is array and other isn't
                        conflicts.push({
                            key: key,
                            values: objects.map(obj => obj ? obj[key] : undefined),
                            resolved: 'used latter value'
                        });
                        acc[key] = current[key];
                    }
                } else {
                    // No conflict, just add the property
                    acc[key] = current[key];
                }
            });
            
            return acc;
        }, {});
    }

    // Replace conflicts merge implementation
    function replaceMerge(objects) {
        return Object.assign({}, ...objects);
    }
});