//Includes
const IOTA = require("iota.lib.js");
const MAM = require('./mam.client.js');
const Wrapper = require('./IOTA_Implementation.js');

let Arg = process.argv;
let ClaimAddress = Arg[2];
let ClaimHash = Arg[3];

let IssuerMAM = new Wrapper.MAM_Publisher(Wrapper.IOTA_Object, Wrapper.IssuerSeed, 2, Wrapper.PRIVACYLEVEL.public);
IssuerMAM.CatchupChannel();
let MamReader = new Wrapper.MAM_Reader(IssuerMAM.GetOriginalRoot(), Wrapper.PRIVACYLEVEL.public);
let RawStream = MamReader.FetchStreamRaw();
RawStream.then((Result) => {
  let Derp = Wrapper.IOTA_Object.utils.fromTrytes(Result.messages[0]);
  console.log(Derp);
});


/*let ClaimPromise = IssuerMAM.PublishMessage("ClaimHash : " + ClaimHash + "; Address : " + UserAddress);
ClaimPromise.then((Result) => {
  console.log(Result);
});*/
