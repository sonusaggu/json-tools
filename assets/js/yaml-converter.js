document.addEventListener('DOMContentLoaded', function() {
    const jsonInput = document.getElementById('json-input');
    const yamlOutput = document.getElementById('yaml-output');
    const convertBtn = document.getElementById('convert-btn');
    const downloadBtn = document.getElementById('download-yaml');
    const copyBtn = document.getElementById('copy-yaml');
    const condense = document.getElementById('condense');
    const indent = document.getElementById('indent');
    
    // Sample data
    const sampleJSON = {
        "apiVersion": "v1",
        "kind": "Pod",
        "metadata": {
            "name": "nginx",
            "labels": {
                "app": "nginx",
                "tier": "frontend"
            }
        },
        "spec": {
            "containers": [{
                "name": "nginx",
                "image": "nginx:1.14.2",
                "ports": [{
                    "containerPort": 80
                }]
            }]
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
        const lines = yamlOutput.textContent.split('\n');
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
        yamlOutput.textContent = 'YAML data will appear here...';
        updateInputLineNumbers();
        updateOutputLineNumbers();
    });
    
    // Conversion function
    function convertToYAML(jsonData, condenseFlow = true, indentSize = 2) {
        try {
            if (!jsonData.trim()) {
                throw new Error('Input is empty');
            }
            
            const obj = JSON.parse(jsonData);
            return jsyaml.dump(obj, {
                indent: indentSize,
                flowLevel: condenseFlow ? -1 : 0,
                skipInvalid: true,
                lineWidth: -1 // No line wrapping
            });
        } catch (error) {
            return `Error: ${error.message}\n\nPlease check:\n1. Valid JSON format\n2. No trailing commas\n3. Properly quoted property names`;
        }
    }
    
    // Convert button
    convertBtn.addEventListener('click', () => {
        if (!jsonInput.value.trim()) {
            yamlOutput.textContent = 'Error: Please enter JSON data first';
            updateOutputLineNumbers();
            return;
        }
        
        const yaml = convertToYAML(
            jsonInput.value,
            condense.checked,
            parseInt(indent.value)
        );
        yamlOutput.textContent = yaml;
        updateOutputLineNumbers();
    });
    
    // Download YAML
    downloadBtn.addEventListener('click', () => {
        const yaml = yamlOutput.textContent;
        if (!yaml || yaml.startsWith('Error:')) {
            alert('Please generate valid YAML first');
            return;
        }
        
        try {
            const blob = new Blob([yaml], { type: 'text/yaml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `converted_${new Date().getTime()}.yaml`;
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
        const yaml = yamlOutput.textContent;
        if (!yaml || yaml.startsWith('Error:')) {
            alert('Please generate valid YAML first');
            return;
        }
        
        navigator.clipboard.writeText(yaml).then(() => {
            const icon = copyBtn.querySelector('i');
            icon.classList.replace('far', 'fas');
            setTimeout(() => icon.classList.replace('fas', 'far'), 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('Failed to copy YAML to clipboard');
        });
    });
    
    // Initialize line numbers
    jsonInput.addEventListener('input', updateInputLineNumbers);
    updateInputLineNumbers();
    updateOutputLineNumbers();
});