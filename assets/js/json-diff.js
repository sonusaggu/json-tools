document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const jsonInput1 = document.getElementById('json-input1');
    const jsonInput2 = document.getElementById('json-input2');
    const diffOutput = document.getElementById('diff-output');
    const compareBtn = document.getElementById('compare-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const clear1Btn = document.getElementById('clear1-btn');
    const clear2Btn = document.getElementById('clear2-btn');
    const sample1Btn = document.getElementById('sample1-btn');
    const sample2Btn = document.getElementById('sample2-btn');
    const charCount1 = document.getElementById('char-count1');
    const charCount2 = document.getElementById('char-count2');
    const diffCount = document.getElementById('diff-count');
    const lineNumbers1 = document.getElementById('line-numbers1');
    const lineNumbers2 = document.getElementById('line-numbers2');

    // Sample data
    const sample1 = {
        "name": "Product API",
        "version": "1.0.0",
        "description": "API for product management",
        "endpoints": {
            "products": "/api/products",
            "categories": "/api/categories"
        },
        "settings": {
            "cache": true,
            "limit": 100
        },
        "tags": ["api", "products", "v1"]
    };

    const sample2 = {
        "name": "Product API",
        "version": "1.1.0",
        "description": "API for product and inventory management",
        "endpoints": {
            "products": "/api/products",
            "categories": "/api/categories",
            "inventory": "/api/inventory"
        },
        "settings": {
            "cache": false,
            "limit": 50,
            "timeout": 30
        },
        "tags": ["api", "products", "v2"],
        "newFeature": true
    };

    // Initialize editors
    function initEditor(editor, lineNumbers, charCount) {
        updateLineNumbers(editor, lineNumbers);
        charCount.textContent = `${editor.value.length} characters`;
        editor.addEventListener('input', () => {
            updateLineNumbers(editor, lineNumbers);
            charCount.textContent = `${editor.value.length} characters`;
        });
        editor.addEventListener('scroll', () => {
            lineNumbers.scrollTop = editor.scrollTop;
        });
    }

    // Update line numbers
    function updateLineNumbers(editor, lineNumbers) {
        const lines = editor.value.split('\n');
        lineNumbers.innerHTML = lines.map((_, i) => i + 1).join('<br>');
    }

    // Initialize both editors
    initEditor(jsonInput1, lineNumbers1, charCount1);
    initEditor(jsonInput2, lineNumbers2, charCount2);

    // Load sample data
    sample1Btn.addEventListener('click', () => {
        jsonInput1.value = JSON.stringify(sample1, null, 2);
        updateLineNumbers(jsonInput1, lineNumbers1);
        charCount1.textContent = `${jsonInput1.value.length} characters`;
    });

    sample2Btn.addEventListener('click', () => {
        jsonInput2.value = JSON.stringify(sample2, null, 2);
        updateLineNumbers(jsonInput2, lineNumbers2);
        charCount2.textContent = `${jsonInput2.value.length} characters`;
    });

    // Clear functions
    clear1Btn.addEventListener('click', () => {
        jsonInput1.value = '';
        updateLineNumbers(jsonInput1, lineNumbers1);
        charCount1.textContent = '0 characters';
    });

    clear2Btn.addEventListener('click', () => {
        jsonInput2.value = '';
        updateLineNumbers(jsonInput2, lineNumbers2);
        charCount2.textContent = '0 characters';
    });

    clearAllBtn.addEventListener('click', () => {
        jsonInput1.value = '';
        jsonInput2.value = '';
        diffOutput.innerHTML = 'Comparison results will appear here...';
        diffCount.textContent = '0 differences';
        updateLineNumbers(jsonInput1, lineNumbers1);
        updateLineNumbers(jsonInput2, lineNumbers2);
        charCount1.textContent = '0 characters';
        charCount2.textContent = '0 characters';
    });

    // Compare JSONs
    compareBtn.addEventListener('click', () => {
        try {
            const json1 = jsonInput1.value ? JSON.parse(jsonInput1.value) : {};
            const json2 = jsonInput2.value ? JSON.parse(jsonInput2.value) : {};
            
            const differences = findDifferences(json1, json2);
            displayDifferences(differences);
            diffCount.textContent = `${differences.length} differences`;
        } catch (error) {
            diffOutput.innerHTML = `<div class="error">Error: ${error.message}</div>`;
            diffCount.textContent = '0 differences';
        }
    });

    // Find differences between two objects
    function findDifferences(obj1, obj2, path = '') {
        const differences = [];
        
        // Handle primitive values
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
            if (!deepEqual(obj1, obj2)) {
                differences.push({
                    path: path || 'root',
                    value1: obj1,
                    value2: obj2,
                    type: 'changed'
                });
            }
            return differences;
        }
        
        // Get all keys from both objects
        const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
        
        for (const key of allKeys) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (!(key in obj1)) {
                // Key added in obj2
                differences.push({
                    path: currentPath,
                    value1: undefined,
                    value2: obj2[key],
                    type: 'added'
                });
            } else if (!(key in obj2)) {
                // Key removed in obj2
                differences.push({
                    path: currentPath,
                    value1: obj1[key],
                    value2: undefined,
                    type: 'removed'
                });
            } else if (!deepEqual(obj1[key], obj2[key])) {
                // Values are different - recurse for objects/arrays
                if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && 
                    obj1[key] !== null && obj2[key] !== null) {
                    differences.push(...findDifferences(obj1[key], obj2[key], currentPath));
                } else {
                    differences.push({
                        path: currentPath,
                        value1: obj1[key],
                        value2: obj2[key],
                        type: 'changed'
                    });
                }
            }
        }
        
        return differences;
    }

    // Deep equality check
    function deepEqual(a, b) {
        if (a === b) return true;
        if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
        
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        
        if (keysA.length !== keysB.length) return false;
        
        for (const key of keysA) {
            if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
                return false;
            }
        }
        
        return true;
    }

    // Display differences
    function displayDifferences(differences) {
        if (differences.length === 0) {
            diffOutput.innerHTML = '<div class="valid">✓ No differences found</div>';
            return;
        }
        
        let html = '<div class="diff-summary">Found ' + differences.length + ' differences:</div>';
        
        // Group differences by type for better organization
        const added = differences.filter(d => d.type === 'added');
        const removed = differences.filter(d => d.type === 'removed');
        const changed = differences.filter(d => d.type === 'changed');
        
        if (removed.length > 0) {
            html += '<div class="diff-section"><h3>Removed Properties</h3>';
            removed.forEach(diff => {
                html += `<div class="diff-item diff-removed">
                    <strong>${diff.path}</strong>: ${formatValue(diff.value1)}
                </div>`;
            });
            html += '</div>';
        }
        
        if (added.length > 0) {
            html += '<div class="diff-section"><h3>Added Properties</h3>';
            added.forEach(diff => {
                html += `<div class="diff-item diff-added">
                    <strong>${diff.path}</strong>: ${formatValue(diff.value2)}
                </div>`;
            });
            html += '</div>';
        }
        
        if (changed.length > 0) {
            html += '<div class="diff-section"><h3>Changed Properties</h3>';
            changed.forEach(diff => {
                html += `<div class="diff-item diff-changed">
                    <strong>${diff.path}</strong><br>
                    <span class="diff-marker">-</span> ${formatValue(diff.value1)}<br>
                    <span class="diff-marker">+</span> ${formatValue(diff.value2)}
                </div>`;
            });
            html += '</div>';
        }
        
        diffOutput.innerHTML = html;
    }

    // Format values for display
    function formatValue(value) {
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';
        if (typeof value === 'object') return JSON.stringify(value);
        return value.toString();
    }
});