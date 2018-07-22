//Includes
const IOTA = require("iota.lib.js");
const MAM = require('./mam.client.js');
const Crypto = require('crypto-js');
const fs = require('fs');

//Create the connection
let IOTA_Object = new IOTA({
  'provider': 'https://nodes.testnet.iota.org:443'
});
exports.IOTA_Object = IOTA_Object;

//Seeds
exports.IssuerSeed = 'OFHVJC9999WA9HXQK99SZOHLFXEBBZWOQ9O9999PFQGMXWUCEYQWCCL99DJYYYZLJHTUJZLLFBTOAWBTA';
exports.UserSeed = 'FFZDGIBYOJFNCKENQCSSZEFNGHXQJJZLNFXTZOHZTEQBHCWDPSXNXDNLBPMVXSPWCGETTJDLRWE9IHCFE';

//Weird enum like object
const PRIVACYLEVEL = {
  public: 'public',
  private: 'private',
  restricted: 'restricted'
}
Object.freeze(PRIVACYLEVEL);
exports.PRIVACYLEVEL = PRIVACYLEVEL;

//Wrapper class to make live easier
exports.MAM_Publisher = class MAM_Publisher {
  constructor(a_IOTA_Object, a_Seed, a_Security, a_PrivacyLevel, a_Sidekey) {
    this.IOTA_Object = a_IOTA_Object;
    this.Seed = a_Seed;
    this.Security = a_Security;
    this.MAM_Object = MAM.init(this.IOTA_Object, this.Seed, this.Security);
    //this.OriginalRoot = this.MAM_Object.next_root;
    if(a_Sidekey != undefined) {
      this.SetSidekey(a_Sidekey);
    }
    this.SetPrivacyLevel(a_PrivacyLevel);
    //Generate a fake msg in order to know the root, we can reuse that
    this.CurrentRoot = null;
    this.OriginalRoot = null;
  }

  CatchupChannel(a_Index) {
    let Index = fs.readFileSync("Issuer.txt", "ascii");
    console.log(Index);
    for(let i=0; i < Index; i++) {
      let Result = MAM.create(this.MAM_Object, "");
      if(this.OriginalRoot == null) {
        this.OriginalRoot = Result.root;
      }
      this.NextRoot = Result.state.channel.next_root;
      this.MAM_Object = Result.state;
      this.CurrentRoot = Result.root;
    }
  }

  SetPrivacyLevel(a_PrivacyLevel) {
    if(PRIVACYLEVEL.hasOwnProperty(a_PrivacyLevel)) {
      if(a_PrivacyLevel != PRIVACYLEVEL.restricted || this.Sidekey) {
        this.PrivacyLevel = a_PrivacyLevel;
        this.MAM_Object = MAM.changeMode(this.MAM_Object, this.PrivacyLevel, this.Sidekey);
      } else {
        console.log('Cannot enter restricted mode without a set Sidekey, call "SetSidekey" first');
        console.log('WARNING: Automatically switching mode to private');
        this.SetPrivacyLevel(PRIVACYLEVEL.private);
      }
    } else {
      console.log('Invalid Privacylevel provided ' + a_PrivacyLevel);
    }
  }

  SetSidekey(a_Sidekey) {
    this.Sidekey = a_Sidekey;
    if(this.PrivacyLevel == PRIVACYLEVEL.restricted) {
      //Updates the channels current sidekey
      this.SetPrivacyLevel(PRIVACYLEVEL.restricted);
    }
  }

  GetSidekey() {
    return this.Sidekey;
  }
  GetOriginalRoot() {
    return this.OriginalRoot;
  }
  GetCurrentRoot() {
    return this.CurrentRoot;
  }
  GetNextRoot() {
    if(this.MAM_Object.channel.next_root == null) {
      return this.OriginalRoot;
    } else {
      return this.MAM_Object.channel.next_root;
    }
  }
  GetCurrentIndex() {
    return this.MAM_Object.channel.start;
  }

  PublishMessage(a_Message) {
    let MAM_Message = MAM.create(this.MAM_Object, IOTA_Object.utils.toTrytes(a_Message));
    this.MAM_Object = MAM_Message.state;
    if(this.OriginalRoot == null) {
      this.OriginalRoot = this.MAM_Object.root;
      //Write Index to
      fs.writeFile("Issuer.txt", "1", function(err) {
        if(err) {
            return console.log(err);
        }
      });
    }
    let CurrentIndex = fs.readFileSync("Issuer.txt", "ascii");
    fs.writeFile("Issuer.txt", parseInt(CurrentIndex)+1, function(err) {
      if(err) {
          return console.log(err);
      }
    });
    this.CurrentRoot = this.MAM_Object.root;
    if(this.MAM_Object.state) {
        this.NextRoot = this.MAM_Object.state.channel.next_root;
    }
    //console.log(this.MAM_Object);
    return MAM.attach(MAM_Message.payload, MAM_Message.address);
  }
}

exports.MAM_Reader = class MAM_Reader {
  constructor(a_Root, a_PrivacyLevel, a_Sidekey) {
      this.Root = a_Root;
      this.Sidekey = a_Sidekey;
      if(PRIVACYLEVEL.hasOwnProperty(a_PrivacyLevel)) {
        this.PrivacyLevel = a_PrivacyLevel;
      } else {
        console.log('Invalid Privacylevel provided ' + a_PrivacyLevel);
        console.log('WARNING: Public stream assumed');
        this.PrivacyLevel = PRIVACYLEVEL.public;
      }
      if(this.PrivacyLevel == PRIVACYLEVEL.restricted && this.Sidekey == undefined) {
        console.log('A sidekey is needed for restricted mode, switching to private mode');
        this.PrivacyLevel = PRIVACYLEVEL.private;
      }
  }

  FetchStream() {
    return MAM.fetch(this.Root, this.PrivacyLevel, this.Sidekey);
  }

  //Decode
  static Decode(a_Transaction) {
    return MAM.decode(a_Payload, a_Sidekey, a_Root);
  }
}

exports.GetClaimStatus = function(SubjectAddress, MAMTransactions) {
  let Hashes = [];
  let Addresses = [];
  let Status = [];
  for(let i in MAMTransactions.messages) {
    let Data = IOTA_Object.utils.fromTrytes(MAMTransactions.messages[i]);
    let SplitData = Data.split(";");
    Hashes.push(SplitData[0].split(":")[1]);
    Addresses.push(SplitData[1].split(":")[1]);
    Status.push(SplitData[2].split(":")[1]);
  }
  //Get the latest status of the claim
  let CurrentIndex = -1;
  for(let i in Addresses) {
    if(Addresses[i] == SubjectAddress) {
        CurrentIndex = i;
    }
  }
  return [Hashes[CurrentIndex], Status[CurrentIndex]];
}


//Seeds
/*const IssuerSeed = 'OFHVJCOMRYWA9HXQKMNSZOHLFXEMZZWOQ9O9SSPPFQGMXWUCEYUSCCLLXDJYYYZLJHTUJZLLFBTOAWBTA';
const UserSeed = 'FFZDGIBYOJFNCKENQCSSZEFNGHXQJJZLNFXTZOHZTEQBHCWDPSXNXDNLBPMVXSPWCGETTJDLRWE9IHCFE';

let IssuerMAM = new MAM_Publisher(IOTA_Object, 'IssuerSeed', 2, PRIVACYLEVEL.public);
IssuerMAM.CatchupChannel(0);
let SubjectMAM = new MAM_Publisher(IOTA_Object, 'UserSeed', 2, PRIVACYLEVEL.public);
SubjectMAM.CatchupChannel(0);

//USER - Proof

//USER - AddClaim

//Issuer - AddClaim
function IssuerAddClaim(Claim) {
  let JSONVersion = JSON.parse(Claim);
  let Keys = Object.keys(JSONVersion[0]);
  let Hashes = [];
  for(let i in Keys) {
    let DataPoint = Keys[i] + ":" + JSONVersion[0][Keys[i]];
    Hashes.push(Crypto.SHA256(DataPoint).toString());
  }
  console.log(Hashes);
  while(Hashes.length > 1) {
    let OldHashes = Hashes;
    Hashes = [];
    for(let i=0; i < OldHashes.length; i+=2) {
      Hashes.push(Crypto.SHA256(OldHashes[i]+OldHashes[i+1]).toString());
    }
      console.log(Hashes);
  }

  //let ClaimPromise = IssuerMAM.PublishMessage(Claim);

  //ClaimPromise.then((Result) = > {
  //  console.log(Result);
  //}
}
let IssuerJSONClaim = '[{' +
' "Name":"Jelle Femmo",' +
' "Surname":"Millenaar", ' +
' "Birthday": "13-11-1992", ' +
' "StartDate":"03-06-2011", ' +
' "ExpireDate":"03-06-2021" ' +
'},' +
'{ "SubjectAddress":"'+SubjectMAM.GetOriginalRoot()+'"}' +
']';
IssuerAddClaim(IssuerJSONClaim);
*/
//Issuer - RevokeClaim
