document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('jsonInput');
    const charCount = document.getElementById('charCount');
    const pojoOutput = document.getElementById('pojoOutput');
    const sampleBtn = document.getElementById('sampleBtn');
    const convertBtn = document.getElementById('convertBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const targetLanguage = document.getElementById('targetLanguage');
    const lineNumbers = document.getElementById('inputLineNumbers');

    function updateLineNumbers() {
        const lines = jsonInput.value.split('\n').length;
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
        lineNumbers.scrollTop = jsonInput.scrollTop;
    }

    jsonInput.addEventListener('input', () => {
        updateLineNumbers();
        if (charCount) {
            charCount.textContent = `${jsonInput.value.length} characters`;
        }
    });

    jsonInput.addEventListener('scroll', () => {
        lineNumbers.scrollTop = jsonInput.scrollTop;
    });

    window.addEventListener('resize', () => {
        lineNumbers.scrollTop = jsonInput.scrollTop;
    });

   
  
    const sampleJSON = {
      user: {
        id: 12345,
        name: 'John Doe',
        email: 'john.doe@example.com',
        active: true,
        roles: ['admin', 'user'],
        profile: {
          age: 30,
          address: {
            street: '123 Main St',
            city: 'New York',
            coordinates: [40.7128, -74.0060]
          }
        },
        orders: [
          {
            orderId: 'ORD-1001',
            items: [{ productId: 'P100', quantity: 2, price: 19.99 }],
            total: 39.98
          }
        ]
      },
      metadata: { createdAt: '2023-01-01T00:00:00Z', updatedAt: null }
    };
  
  
    sampleBtn.addEventListener('click', () => {
      jsonInput.value = JSON.stringify(sampleJSON, null, 2);
      charCount.textContent = `${jsonInput.value.length} characters`;
      pojoOutput.textContent = 'Click Convert to generate POJO';
    });

     // Initialize on load
     updateLineNumbers();
  
    clearBtn.addEventListener('click', () => {
      jsonInput.value = '';
      charCount.textContent = '0 characters';
      pojoOutput.textContent = 'Converted POJO will appear here...';
    });
    // Initialize on load
    updateLineNumbers();
  
    convertBtn.addEventListener('click', () => {
      try {
        if (!jsonInput.value.trim()) {
          throw new Error('Input is empty');
        }
        const data = JSON.parse(jsonInput.value);
        const code = convertToPOJO(data, targetLanguage.value);
        pojoOutput.textContent = code;
      } catch (err) {
        pojoOutput.innerHTML = `<span class="error">✗ ${err.message}</span>`;
        console.error(err);
      }
    });
  
    copyBtn.addEventListener('click', () => {
        const txt = pojoOutput.textContent;
        if (!txt || txt.includes('Click Convert')) return;
        navigator.clipboard.writeText(txt)
          .then(() => {
            // Silent or show temporary message
            const msg = document.createElement('span');
            msg.textContent = 'Copied!';
            msg.style.marginLeft = '10px';
            msg.style.color = '#28a745';
            copyBtn.parentNode.appendChild(msg);
            setTimeout(() => msg.remove(), 2000);
          })
          .catch(() => {
            console.error('Copy failed');
          });
      });
      
  
    // Converter Dispatcher
    function convertToPOJO(data, lang) {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON data');
      }
      const rootName = {
        java: 'Root',
        python: 'RootModel',
        typescript: 'IRoot',
        javascript: 'Root'
      }[lang] || 'Root';
  
      switch (lang) {
        case 'java':
          return generateJavaClass(data, rootName);
        case 'python':
          return generatePythonClass(data, rootName);
        case 'typescript':
          return generateTypeScriptInterface(data, rootName);
        case 'javascript':
          return generateJavaScriptClass(data, rootName);
        default:
          throw new Error('Unsupported language');
      }
    }
  
    // Utility
    function capitalize(s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
  
    /* === Java === */
    function generateJavaClass(obj, root) {
      const defs = {};
      collectJava(obj, root, defs);
      let out = '';
      Object.entries(defs).forEach(([cls, fields]) => {
        if (cls !== root) out += singleJava(cls, fields || {}) + '\n\n';
      });
      out += singleJava(root, defs[root] || {});
      return out;
    }
  
    function collectJava(obj, cls, defs) {
      if (!obj || typeof obj !== 'object' || defs[cls]) return;
      defs[cls] = {};
      Object.entries(obj).forEach(([k, v]) => {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          const child = cls + capitalize(k);
          defs[cls][k] = child;
          collectJava(v, child, defs);
        } else if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
          const child = cls + capitalize(k.replace(/s$/, ''));
          defs[cls][k] = `List<${child}>`;
          collectJava(v[0], child, defs);
        } else {
          defs[cls][k] = determineJavaType(v);
        }
      });
    }
  
    function singleJava(name, fields) {
      let s = `public class ${name} {\n`;
      Object.entries(fields).forEach(([k, t]) => {
        s += `    private ${t} ${k};\n`;
      });
      s += `\n    public ${name}() {}\n\n    public ${name}(${Object.entries(fields).map(([k, t]) => `${t} ${k}`).join(', ')}) {\n`;
      Object.keys(fields).forEach(k => {
        s += `        this.${k} = ${k};\n`;
      });
      s += `    }\n`;
      Object.entries(fields).forEach(([k, t]) => {
        const C = capitalize(k);
        s += `\n    public ${t} get${C}() { return ${k}; }\n    public void set${C}(${t} ${k}) { this.${k} = ${k}; }\n`;
      });
      s += `\n    @Override\n    public String toString() {\n        return "${name}{" +\n`;
      s += Object.keys(fields).map(k => `            "${k}=" + ${k}`).join(' + ", " +\n') + `\n        ;\n    }\n}`;
      return s;
    }
  
    function determineJavaType(x) {
      if (x === null) return 'Object';
      if (Array.isArray(x)) return x.length ? `List<${determineJavaType(x[0])}>` : 'List<Object>';
      if (typeof x === 'object') return 'Object';
      if (typeof x === 'string') return 'String';
      if (typeof x === 'boolean') return 'boolean';
      if (typeof x === 'number') return Number.isInteger(x) ? 'int' : 'double';
      return 'Object';
    }
  
    /* === Python === */
    function generatePythonClass(obj, root) {
      const defs = {};
      collectPython(obj, root, defs);
      let out = `from dataclasses import dataclass\nfrom typing import List, Optional, Any\nfrom datetime import datetime\n\n`;
      Object.entries(defs).forEach(([cls, fields]) => {
        if (cls !== root) out += singlePython(cls, fields || {}) + '\n\n';
      });
      out += singlePython(root, defs[root] || {});
      return out;
    }
  
    function collectPython(obj, cls, defs) {
      if (!obj || typeof obj !== 'object' || defs[cls]) return;
      defs[cls] = {};
      Object.entries(obj).forEach(([k, v]) => {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          const child = cls + capitalize(k);
          defs[cls][k] = child;
          collectPython(v, child, defs);
        } else if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
          const child = cls + capitalize(k.replace(/s$/, ''));
          defs[cls][k] = `List[${child}]`;
          collectPython(v[0], child, defs);
        } else {
          defs[cls][k] = determinePythonType(v);
        }
      });
    }
  
    function singlePython(name, fields) {
      let s = `@dataclass\nclass ${name}:\n`;
      Object.entries(fields).forEach(([k, t]) => {
        s += `    ${k}: ${t}\n`;
      });
      return s;
    }
  
    function determinePythonType(x) {
      if (x === null) return 'Optional[Any]';
      if (x === undefined) return 'Any';
      if (Array.isArray(x)) return x.length ? `List[${determinePythonType(x[0])}]` : 'List[Any]';
      if (typeof x === 'object') return 'Any';
      if (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})?$/.test(x)) return 'datetime';
      if (typeof x === 'string') return 'str';
      if (typeof x === 'boolean') return 'bool';
      if (typeof x === 'number') return x % 1 !== 0 ? 'float' : 'int';
      return 'Any';
    }
  
    /* === TypeScript === */
    function generateTypeScriptInterface(obj, root) {
      const defs = {};
      collectTS(obj, root, defs);
      let out = '';
      Object.entries(defs).forEach(([cls, fields]) => {
        if (cls !== root) out += singleTS(cls, fields || {}) + '\n\n';
      });
      out += singleTS(root, defs[root] || {});
      return out;
    }
  
    function collectTS(obj, cls, defs) {
      if (!obj || typeof obj !== 'object' || defs[cls]) return;
      defs[cls] = {};
      Object.entries(obj).forEach(([k, v]) => {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          const child = cls + capitalize(k);
          defs[cls][k] = child;
          collectTS(v, child, defs);
        } else if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
          const child = cls + capitalize(k.replace(/s$/, ''));
          defs[cls][k] = `${child}[]`;
          collectTS(v[0], child, defs);
        } else {
          defs[cls][k] = determineTSType(v);
        }
      });
    }
  
    function singleTS(name, fields) {
      let s = `interface ${name} {\n`;
      Object.entries(fields).forEach(([k, t]) => {
        s += `    ${k}: ${t};\n`;
      });
      return s + '}';
    }
  
    function determineTSType(x) {
      if (x === null) return 'null';
      if (x === undefined) return 'undefined';
      if (Array.isArray(x)) return x.length ? `${determineTSType(x[0])}[]` : 'any[]';
      if (typeof x === 'object') return 'any';
      if (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})?$/.test(x)) return 'Date | string';
      if (typeof x === 'string') return 'string';
      if (typeof x === 'boolean') return 'boolean';
      if (typeof x === 'number') return 'number';
      return 'any';
    }
  
    /* === JavaScript === */
    function generateJavaScriptClass(obj, root) {
      const defs = {};
      collectJS(obj, root, defs);
      let out = '';
      Object.entries(defs).forEach(([cls, fields]) => {
        if (cls !== root) out += singleJS(cls, fields || {}) + '\n\n';
      });
      out += singleJS(root, defs[root] || {});
      return out;
    }
  
    function collectJS(obj, cls, defs) {
      if (!obj || typeof obj !== 'object' || defs[cls]) return;
      defs[cls] = {};
      Object.entries(obj).forEach(([k, v]) => {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          const child = cls + capitalize(k);
          defs[cls][k] = child;
          collectJS(v, child, defs);
        } else if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
          const child = cls + capitalize(k.replace(/s$/, ''));
          defs[cls][k] = `${child}[]`;
          collectJS(v[0], child, defs);
        } else {
          defs[cls][k] = determineJSType(v);
        }
      });
    }
  
    function singleJS(name, fields) {
      let s = `class ${name} {\n  constructor(data = {}) {\n`;
      Object.entries(fields).forEach(([k, t]) => {
        if (t.endsWith('[]')) {
          const it = t.slice(0, -2);
          s += `    this.${k} = (data.${k} || []).map(item => new ${it}(item));\n`;
        } else if (/^[A-Z]/.test(t)) {
          s += `    this.${k} = data.${k} ? new ${t}(data.${k}) : null;\n`;
        } else {
          s += `    this.${k} = data.${k} || ${getJSDefault(t)};\n`;
        }
      });
      s += `  }\n\n  toJSON() {\n    return {`;
      s += Object.keys(fields).map(k => {
        const isClass = /^[A-Z]/.test(fields[k]) && !fields[k].endsWith('[]');
        return `${k}: this.${k}${isClass ? '?.toJSON()' : ''}`;
      }).join(', ');
      s += `};\n  }\n}`;
      return s;
    }
  
    function determineJSType(x) {
      if (x === null) return 'null';
      if (x === undefined) return 'undefined';
      if (Array.isArray(x)) return x.length ? `${determineJSType(x[0])}[]` : 'Array';
      if (typeof x === 'object') return 'object';
      if (typeof x === 'string') return 'string';
      if (typeof x === 'boolean') return 'boolean';
      if (typeof x === 'number') return 'number';
      return 'any';
    }
  
    function getJSDefault(t) {
      return ({
        string: "''",
        number: '0',
        boolean: 'false',
        Array: '[]',
        object: '{}',
        null: 'null',
        undefined: 'undefined'
      })[t] || 'null';
    }
  });
  
  