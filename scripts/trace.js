const potrace = require('potrace');
const fs = require('fs');
const path = require('path');

const input = path.resolve(__dirname, '../public/IMG_8459.PNG');
const output = path.resolve(__dirname, '../public/logo.svg');

console.log('Tracing', input, '->', output);

potrace.trace(input, {
  threshold: 128,
  turdSize: 100,
  optTolerance: 0.4,
  background: '#0000',
}, (err, svg) => {
  if (err) {
    console.error('Trace error:', err);
    process.exit(1);
  }
  fs.writeFileSync(output, svg);
  console.log('Wrote', output);
});
