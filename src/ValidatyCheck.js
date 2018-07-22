//Includes
const IOTA = require("iota.lib.js");
const MAM = require('./mam.client.js');
const Wrapper = require('./IOTA_Implementation.js');

let Arg = process.argv;
let ClaimHash = Arg[2];
let ClaimAddress = Arg[3];
let UserAddress = Arg[4];
let Data = ValidatyCheck(Arg[2], Arg[3], Arg[4]);
console.log( Data);
function ValidatyCheck(ClaimHash, ClaimAddress, UserAddress) {
  let UserMAM = new Wrapper.MAM_Publisher(Wrapper.IOTA_Object, Wrapper.UserSeed, 2, Wrapper.PRIVACYLEVEL.public);
  UserMAM.CatchupChannel();
  let MamReader = new Wrapper.MAM_Reader(ClaimAddress, Wrapper.PRIVACYLEVEL.public);

  //Transaction data
  let PromTransactions = MamReader.FetchStream();

  PromTransactions.then((Result) => {
    let ClaimStatus = Wrapper.GetClaimStatus(UserAddress, Result );
    if(ClaimStatus[1] == "Revoked") {
      console.log("Claim has been revoked!");
      return false;
    } else if(ClaimStatus[0] == ClaimHash) {
      console.log("Claimhash matches!");
      return true;
    }
    return true;
  });

  PromTransactions.catch((Result) => {
    console.log(Result);
  });
}
