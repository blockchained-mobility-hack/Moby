//Includes
const IOTA = require("iota.lib.js");
const MAM = require('./mam.client.js');
const Wrapper = require('./IOTA_Implementation.js');

let Arg = process.argv;
console.log(Arg);
let UserAddress = Arg[2];
console.log(UserAddress);
let ClaimHash = Arg[3];

let IssuerMAM = new Wrapper.MAM_Publisher(Wrapper.IOTA_Object, Wrapper.IssuerSeed, 2, Wrapper.PRIVACYLEVEL.public);
IssuerMAM.CatchupChannel();
let ClaimPromise = IssuerMAM.PublishMessage("ClaimHash : " + ClaimHash.toString() + "; Address : " + UserAddress.toString());
ClaimPromise.then((Result) => {
  console.log(Result);
});

//KS9DKLQXPOIDZQEIIFM9EJRLVRTMGOFHVMXQVQPGXPJRISEKOTQYJZZTEGGLDVOJCLYNGXVIMNPLBCVNT
//NRJJZUHCKBFYNYHTXPBCPFJIDEIRUBJZLZXCFYXHJCDCSIDOLHOGGBPRFVHUHBPKCSLOBPUADALHNQNCG
