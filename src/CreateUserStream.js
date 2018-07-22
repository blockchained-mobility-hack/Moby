//Includes
const IOTA = require("iota.lib.js");
const MAM = require('./mam.client.js');
const Wrapper = require('./IOTA_Implementation.js');

let Arg = process.argv;

let IssuerMAM = new Wrapper.MAM_Publisher(Wrapper.IOTA_Object, Wrapper.UserSeed, 2, Wrapper.PRIVACYLEVEL.public);
IssuerMAM.CatchupChannel();
let ClaimPromise = IssuerMAM.PublishMessage("Starting Transaction");
ClaimPromise.then((Result) => {
  console.log(Result);
});
