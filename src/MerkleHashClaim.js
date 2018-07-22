//Includes
const Crypto = require('crypto-js');

function MerkleHashClaim(data){

//Get the JSON data
    let JSONClaim = data;
    //JSONClaim = decodeURIComponent(JSONClaim);
    JSONClaim = JSON.parse(JSONClaim);

//Retrieve the data
    let Depth = [];
    let Hashes = [];
    let CurrentDepth = 0;
    for(let i in JSONClaim) {
        let Keys = Object.keys(JSONClaim[i]);
        if(Keys[0] != "Hash") {
            let DataPoint = Keys[0] + ":" + JSONClaim[i][Keys[0]];
            Hashes.push(Crypto.SHA256(DataPoint).toString());
        } else {
            Hashes.push(JSONClaim[i]["Hash"]);
        }

        let ThisDepth = JSONClaim[i]["Depth"];
        Depth.push(ThisDepth);
        if(ThisDepth > CurrentDepth) {
            CurrentDepth = ThisDepth;
        }
    }
    let MaxDepth = CurrentDepth;
    for(let i=0; i < MaxDepth-1; i++) {
        let NewHashes = [];
        let NewDepth = [];
        let FirstIndex = -1;
        for(let k in Hashes) {
            if(Depth[k] == CurrentDepth) {
                if(FirstIndex == -1) {
                    FirstIndex = k;
                } else {
                    NewHashes.push(Crypto.SHA256(Hashes[FirstIndex]+Hashes[k]).toString());
                    NewDepth.push(CurrentDepth-1);
                    FirstIndex = -1;
                }
            } else {
                NewHashes.push(Hashes[k]);
                NewDepth.push(Depth[k]);
            }
        }
        //Update state
        Hashes = NewHashes;
        Depth = NewDepth;
        CurrentDepth--;
    }
    console.log(Hashes);
    return Hashes[0];

}

module.exports = MerkleHashClaim;