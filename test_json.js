const data = '{"__proto__": {"polluted": "yes"}}';
JSON.parse(data);
console.log({}.polluted);
