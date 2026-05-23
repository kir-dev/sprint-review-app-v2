const { parse } = require('flatted');

try {
  // flatted format: ["a",{"b":"c"}]
  // Attempt to pollute the prototype
  parse('["",{"__proto__":{"polluted":"yes"}}]');

  // Check if pollution was successful
  if ({}.polluted === 'yes') {
    console.log('VULNERABLE');
  } else {
    console.log('NOT VULNERABLE');
  }
} catch (e) {
  console.log('NOT VULNERABLE');
}
