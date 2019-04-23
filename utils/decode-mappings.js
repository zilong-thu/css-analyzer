const fs  = require('fs');
const vlq = require('vlq');


module.exports = function(mappings) {
  const vlqs = mappings.split(';').map(line => line.split(',')).filter(i => i && !!i[0]);

  let decoded = vlqs.map(line => line.map(vlq.decode));

  let sourceFileIndex = 0;   // second field
  let sourceCodeLine = 0;    // third field
  let sourceCodeColumn = 0;  // fourth field
  let nameIndex = 0;         // fifth field

  let decoded2 = decoded.map(line => {
    let generatedCodeColumn = 0; // first field - reset each time

    return line.map(segment => {
      let result;

      generatedCodeColumn += segment[0];

      result = [generatedCodeColumn];

      if (segment.length === 1) {
        // only one field!
        return result;
      }

      sourceFileIndex  += segment[1];
      sourceCodeLine   += segment[2];
      sourceCodeColumn += segment[3];

      result.push(sourceFileIndex, sourceCodeLine, sourceCodeColumn);

      if (segment.length === 5) {
        nameIndex += segment[4];
        result.push(nameIndex);
      }

      return result;
    });
  });

  fs.writeFileSync('./vlqs-decoded.json', JSON.stringify(decoded2, null, 2));
  return decoded2;
}
