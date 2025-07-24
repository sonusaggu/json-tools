document.addEventListener('DOMContentLoaded', function() {
    const jsonInput = document.getElementById('json-input');
    const schemaOutput = document.getElementById('schema-output');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-schema');
    const copyBtn = document.getElementById('copy-schema');
    const includeRequired = document.getElementById('include-required');
    const includeDescriptions = document.getElementById('include-descriptions');
    const schemaVersion = document.getElementById('schema-version');
    
    // Sample data
    const sampleJSON = {
        "productId": 1,
        "productName": "Laptop",
        "price": 999.99,
        "tags": ["electronics", "laptop"],
        "dimensions": {
            "length": 15,
            "width": 10,
            "height": 1.5
        },
        "warehouseLocation": {
            "latitude": -75.143,
            "longitude": 40.038
        }
    };
    
    // Update line numbers for input
    function updateInputLineNumbers() {
        const lines = jsonInput.value.split('\n');
        let lineNumbersHTML = '';
        for (let i = 0; i < lines.length; i++) {
            lineNumbersHTML += (i + 1) + '<br>';
        }
        document.querySelector('.editor-wrapper .line-numbers').innerHTML = lineNumbersHTML;
    }
    
    // Update line numbers for output
    function updateOutputLineNumbers() {
        const lines = schemaOutput.textContent.split('\n');
        let lineNumbersHTML = '';
        for (let i = 0; i < lines.length; i++) {
            lineNumbersHTML += (i + 1) + '<br>';
        }
        document.querySelector('.result-wrapper .output-line-numbers').innerHTML = lineNumbersHTML;
    }
    
    // Load sample
    document.getElementById('sample-data').addEventListener('click', () => {
        jsonInput.value = JSON.stringify(sampleJSON, null, 2);
        updateInputLineNumbers();
    });
    
    // Clear input
    document.getElementById('clear-input').addEventListener('click', () => {
        jsonInput.value = '';
        schemaOutput.textContent = 'Schema will appear here...';
        updateInputLineNumbers();
        updateOutputLineNumbers();
    });
    
    // Basic schema generator function
    function generateSchema(jsonData, options = {}) {
        try {
            if (!jsonData.trim()) {
                throw new Error('Input is empty');
            }
            
            const obj = JSON.parse(jsonData);
            
            // Create basic schema structure
            const schema = {
                "$schema": `http://json-schema.org/${options.schemaVersion || 'draft-07'}/schema#`,
                "type": "object",
                "properties": {},
                "required": []
            };
            
            // Generate properties
            for (const [key, value] of Object.entries(obj)) {
                schema.properties[key] = {};
                
                // Determine type
                if (value === null) {
                    schema.properties[key].type = "null";
                } else {
                    schema.properties[key].type = typeof value;
                }
                
                // Handle arrays
                if (Array.isArray(value) && value.length > 0) {
                    schema.properties[key].type = "array";
                    schema.properties[key].items = {
                        type: typeof value[0]
                    };
                }
                
                // Handle nested objects
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    schema.properties[key].type = "object";
                    schema.properties[key].properties = {};
                    for (const [nestedKey, nestedValue] of Object.entries(value)) {
                        schema.properties[key].properties[nestedKey] = {
                            type: typeof nestedValue
                        };
                    }
                }
                
                // Add to required fields if option is enabled
                if (options.includeRequired) {
                    schema.required.push(key);
                }
                
                // Add description if option is enabled
                if (options.includeDescriptions) {
                    schema.properties[key].description = `Description for ${key}`;
                }
            }
            
            return JSON.stringify(schema, null, 2);
        } catch (error) {
            console.error('Schema generation error:', error);
            return `Error: ${error.message}\n\nPlease check:\n1. Valid JSON format\n2. No trailing commas\n3. Properly quoted property names`;
        }
    }
    
    // Generate button
    generateBtn.addEventListener('click', () => {
        if (!jsonInput.value.trim()) {
            schemaOutput.textContent = 'Error: Please enter JSON data first';
            updateOutputLineNumbers();
            return;
        }
        
        const schema = generateSchema(
            jsonInput.value,
            {
                includeRequired: includeRequired.checked,
                includeDescriptions: includeDescriptions.checked,
                schemaVersion: schemaVersion.value
            }
        );
        schemaOutput.textContent = schema;
        updateOutputLineNumbers();
    });
    
    // Download Schema
    downloadBtn.addEventListener('click', () => {
        const schema = schemaOutput.textContent;
        if (!schema || schema.startsWith('Error:')) {
            alert('Please generate valid schema first');
            return;
        }
        
        try {
            const blob = new Blob([schema], { type: 'application/schema+json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `schema_${new Date().getTime()}.json`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed: ' + error.message);
        }
    });
    
    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        const schema = schemaOutput.textContent;
        if (!schema || schema.startsWith('Error:')) {
            alert('Please generate valid schema first');
            return;
        }
        
        navigator.clipboard.writeText(schema).then(() => {
            const icon = copyBtn.querySelector('i');
            icon.classList.replace('far', 'fas');
            setTimeout(() => icon.classList.replace('fas', 'far'), 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('Failed to copy schema to clipboard');
        });
    });
    
    // Initialize line numbers
    jsonInput.addEventListener('input', updateInputLineNumbers);
    updateInputLineNumbers();
    updateOutputLineNumbers();
});