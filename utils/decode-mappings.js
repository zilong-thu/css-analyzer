const codec = require('sourcemap-codec');

module.exports = function(mappings) {
  return codec.decode(mappings);
}
