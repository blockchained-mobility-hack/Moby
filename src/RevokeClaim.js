//Includes
const IOTA = require("iota.lib.js");
const MAM = require('./mam.client.js');
const Wrapper = require('./IOTA_Implementation.js');

let Arg = process.argv;
let ClaimAddress = Arg[2];

let IssuerMAM = new Wrapper.MAM_Publisher(Wrapper.IOTA_Object, Wrapper.IssuerSeed, 2, Wrapper.PRIVACYLEVEL.public);
IssuerMAM.CatchupChannel();
let MamReader = new Wrapper.MAM_Reader(IssuerMAM.GetOriginalRoot(), Wrapper.PRIVACYLEVEL.public);

//Transaction data
let PromTransactions = MamReader.FetchStream();

PromTransactions.then((Result) => {
  let ClaimStatus = Wrapper.GetClaimStatus(ClaimAddress, Result );
  console.log(ClaimStatus);
  if(ClaimStatus[0] && ClaimStatus[1] != "Revoked") {
    console.log("Revoking");
    let ClaimPromise = IssuerMAM.PublishMessage("ClaimHash:" + ClaimStatus[0] + "; Address:" + ClaimAddress + "; Status:Revoked");
    ClaimPromise.then((Result) => {
      console.log(Result);
    });
  }
});
