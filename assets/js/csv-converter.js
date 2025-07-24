document.addEventListener('DOMContentLoaded', function() {
    const jsonInput = document.getElementById('json-input');
    const csvOutput = document.getElementById('csv-output');
    const convertBtn = document.getElementById('convert-btn');
    const downloadBtn = document.getElementById('download-csv');
    const copyBtn = document.getElementById('copy-csv');
    const includeHeaders = document.getElementById('include-headers');
    const delimiter = document.getElementById('delimiter');
    
    // Sample data
    const sampleJSON = [
        { "id": 1, "name": "Product A", "price": 19.99, "stock": true },
        { "id": 2, "name": "Product B", "price": 29.99, "stock": false },
        { "id": 3, "name": "Product C", "price": 39.99, "stock": true }
    ];
    
    // Load sample
    document.getElementById('sample-data').addEventListener('click', () => {
        jsonInput.value = JSON.stringify(sampleJSON, null, 2);
        updateLineNumbers();
    });
    
    // Clear input
    document.getElementById('clear-input').addEventListener('click', () => {
        jsonInput.value = '';
        csvOutput.textContent = 'CSV data will appear here...';
        updateLineNumbers();
    });
    
    // Update line numbers
    function updateLineNumbers() {
        const lines = jsonInput.value.split('\n');
        let lineNumbersHTML = '';
        for (let i = 0; i < lines.length; i++) {
            lineNumbersHTML += (i + 1) + '<br>';
        }
        document.querySelector('.line-numbers').innerHTML = lineNumbersHTML;
    }
    
    // Conversion function
    function convertToCSV(jsonData, includeHeaders = true, delimiter = ',') {
        try {
            const array = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (!Array.isArray(array)) throw new Error('Input must be a JSON array');
            
            // Get headers
            const headers = includeHeaders 
                ? Object.keys(array[0]).join(delimiter) + '\n' 
                : '';
            
            // Process rows
            const rows = array.map(obj => {
                return Object.values(obj).map(value => {
                    // Handle values containing delimiters or newlines
                    if (typeof value === 'string' && 
                        (value.includes(delimiter) || value.includes('\n'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(delimiter);
            }).join('\n');
            
            return headers + rows;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }
    
    // Convert button
    convertBtn.addEventListener('click', () => {
        const csv = convertToCSV(
            jsonInput.value,
            includeHeaders.checked,
            delimiter.value
        );
        csvOutput.textContent = csv;
        updateOutputLineNumbers();
    });
    
    // Update output line numbers
    function updateOutputLineNumbers() {
        const lines = csvOutput.textContent.split('\n');
        let lineNumbersHTML = '';
        for (let i = 0; i < lines.length; i++) {
            lineNumbersHTML += (i + 1) + '<br>';
        }
        document.querySelector('.output-line-numbers').innerHTML = lineNumbersHTML;
    }
    
    // Download CSV
    downloadBtn.addEventListener('click', () => {
        const csv = csvOutput.textContent;
        if (!csv || csv.startsWith('Error:')) return;
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        const csv = csvOutput.textContent;
        if (!csv || csv.startsWith('Error:')) return;
        
        navigator.clipboard.writeText(csv).then(() => {
            const icon = copyBtn.querySelector('i');
            icon.classList.replace('far', 'fas');
            setTimeout(() => icon.classList.replace('fas', 'far'), 2000);
        });
    });
    
    // Initialize line numbers
    jsonInput.addEventListener('input', updateLineNumbers);
    updateLineNumbers();
});