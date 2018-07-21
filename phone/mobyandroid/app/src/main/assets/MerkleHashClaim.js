//Includes
const Crypto = require('crypto-js');

function MerkleHashClaim(JSONClaim) {
  JSONClaim = decodeURIComponent(JSONClaim);
  JSONClaim = JSON.parse(JSONClaim);
  let Keys = Object.keys(JSONClaim[0]);
  let Hashes = [];
  for(let i in Keys) {
    let DataPoint = Keys[i] + ":" + JSONClaim[0][Keys[i]];
    Hashes.push(Crypto.SHA256(DataPoint).toString());
  }
  while(Hashes.length > 1) {
    let OldHashes = Hashes;
    Hashes = [];
    for(let i=0; i < OldHashes.length; i+=2) {
      Hashes.push(Crypto.SHA256(OldHashes[i]+OldHashes[i+1]).toString());
    }
  }
  return Hashes[0];
}
