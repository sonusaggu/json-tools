// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if X2JS is loaded
    if (typeof X2JS === 'undefined') {
        const errorMsg = 'Error: Failed to load X2JS converter library. Please check your internet connection.';
        console.error(errorMsg);
        document.getElementById('xml-output').textContent = errorMsg;
        return;
    }

    const jsonInput = document.getElementById('json-input');
    const xmlOutput = document.getElementById('xml-output');
    const convertBtn = document.getElementById('convert-btn');
    const downloadBtn = document.getElementById('download-xml');
    const copyBtn = document.getElementById('copy-xml');
    const prettyPrint = document.getElementById('pretty-print');
    const rootElement = document.getElementById('root-element');
    
    // Initialize X2JS with configuration
    const x2js = new X2JS({
        escapeMode: true,
        attributePrefix: '_',
        enableToStringFunc: true,
        arrayAccessForm: 'property',
        emptyNodeForm: 'text'
    });

    // Sample data
    const sampleJSON = {
        "person": {
            "name": "John Doe",
            "age": 30,
            "address": {
                "street": "123 Main St",
                "city": "New York"
            },
            "emails": ["john@example.com", "j.doe@work.com"],
            "metadata": {
                "_created": "2023-01-01",
                "modified": "2023-05-15"
            }
        }
    };
    
    // Load sample
    document.getElementById('sample-data').addEventListener('click', () => {
        jsonInput.value = JSON.stringify(sampleJSON, null, 2);
        updateLineNumbers();
    });
    
    // Clear input
    document.getElementById('clear-input').addEventListener('click', () => {
        jsonInput.value = '';
        xmlOutput.textContent = 'XML data will appear here...';
        updateLineNumbers();
    });
    
    // Update line numbers for input
    function updateLineNumbers() {
        const lines = jsonInput.value.split('\n');
        let lineNumbersHTML = '';
        for (let i = 0; i < lines.length; i++) {
            lineNumbersHTML += (i + 1) + '<br>';
        }
        document.querySelector('.line-numbers').innerHTML = lineNumbersHTML;
    }
    
    // Conversion function
    function convertToXML(jsonData, pretty = true, rootName = 'root') {
        try {
            if (!jsonData.trim()) {
                throw new Error('Input is empty');
            }
            
            const obj = JSON.parse(jsonData);
            const xmlDoc = x2js.js2xml(obj);
            
            if (!xmlDoc) {
                throw new Error('Conversion failed - invalid JSON structure');
            }
            
            // Format with proper XML declaration
            let xmlString = `<?xml version="1.0" encoding="UTF-8"?>`;
            
            if (pretty) {
                const formatted = formatXml(`<${rootName}>${xmlDoc}</${rootName}>`);
                xmlString += '\n' + formatted;
            } else {
                xmlString += `<${rootName}>${xmlDoc}</${rootName}>`;
            }
            
            return xmlString;
        } catch (error) {
            console.error('Conversion error:', error);
            return `Error: ${error.message}\n\nPlease check:\n1. Valid JSON format\n2. No trailing commas\n3. Properly quoted property names`;
        }
    }
    
    // XML formatter
    function formatXml(xml) {
        const PADDING = '  ';
        let formatted = '';
        let indent = '';
        let inTag = false;
        let inAttribute = false;
        
        xml.split('').forEach(char => {
            if (char === '<') {
                if (inTag) {
                    formatted += '\n' + indent;
                }
                formatted += char;
                inTag = true;
                inAttribute = false;
            } else if (char === '>') {
                formatted += char;
                inTag = false;
                inAttribute = false;
            } else if (inTag && char === ' ') {
                if (!inAttribute) {
                    formatted += '\n' + indent + '  ';
                    inAttribute = true;
                }
                formatted += char;
            } else if (char === '\n' || char === '\r') {
                // Ignore existing newlines
            } else {
                formatted += char;
                if (char === '"') inAttribute = !inAttribute;
            }
        });
        
        return formatted.replace(/\n\s*\n/g, '\n').trim();
    }
    
    // Convert button
    convertBtn.addEventListener('click', () => {
        if (!jsonInput.value.trim()) {
            xmlOutput.textContent = 'Error: Please enter JSON data first';
            return;
        }
        
        const xml = convertToXML(
            jsonInput.value,
            prettyPrint.checked,
            rootElement.value
        );
        xmlOutput.textContent = xml;
        updateOutputLineNumbers();
    });
    
    // Update output line numbers
    function updateOutputLineNumbers() {
        const lines = xmlOutput.textContent.split('\n');
        let lineNumbersHTML = '';
        for (let i = 0; i < lines.length; i++) {
            lineNumbersHTML += (i + 1) + '<br>';
        }
        document.querySelector('.output-line-numbers').innerHTML = lineNumbersHTML;
    }
    
    // Download XML
    downloadBtn.addEventListener('click', () => {
        const xml = xmlOutput.textContent;
        if (!xml || xml.startsWith('Error:')) {
            alert('Please generate valid XML first');
            return;
        }
        
        try {
            const blob = new Blob([xml], { 
                type: 'application/xml;charset=utf-8' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `converted_${new Date().getTime()}.xml`;
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
        const xml = xmlOutput.textContent;
        if (!xml || xml.startsWith('Error:')) {
            alert('Please generate valid XML first');
            return;
        }
        
        navigator.clipboard.writeText(xml).then(() => {
            const icon = copyBtn.querySelector('i');
            icon.classList.replace('far', 'fas');
            setTimeout(() => icon.classList.replace('fas', 'far'), 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('Failed to copy XML to clipboard');
        });
    });
    
    // Initialize line numbers
    jsonInput.addEventListener('input', updateLineNumbers);
    updateLineNumbers();
});