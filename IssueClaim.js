//Includes
const IOTA = require("iota.lib.js");
const MAM = require('./mam.client.js');
const Wrapper = require('./IOTA_Implementation.js');

let Arg = process.argv;
let UserAddress = Arg[2];
let ClaimHash = Arg[3];

let IssuerMAM = new Wrapper.MAM_Publisher(Wrapper.IOTA_Object, Wrapper.IssuerSeed, 2, Wrapper.PRIVACYLEVEL.public);
IssuerMAM.CatchupChannel(0);
let ClaimPromise = IssuerMAM.PublishMessage("ClaimHash : " + ClaimHash + "; Address : " + UserAddress);
ClaimPromise.then((Result) => {
  console.log(Result);
});
