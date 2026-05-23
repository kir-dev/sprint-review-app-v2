const flatted = require('flatted');
const parsed = flatted.parse('[{"x":"__proto__"}]');
console.log(JSON.stringify(parsed, null, 2));
