//Includes
const IOTA = require("iota.lib.js");
const MAM = require('mam.client.js');

//Create the connection
let IOTA_Object = new IOTA({
  'provider': 'https://nodes.testnet.iota.org:443'
});

//Weird enum like object
const PRIVACYLEVEL = {
  public: 'public',
  private: 'private',
  restricted: 'restricted'
}
Object.freeze(PRIVACYLEVEL);

//Wrapper class to make live easier
class MAM_Publisher {
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
    let FakeMsg = MAM.create(this.MAM_Object, "");
    this.CurrentRoot = null;
    this.OriginalRoot = FakeMsg.root;
  }

  CatchupChannel(a_Index) {
    for(let i=0; i < a_Index; i++) {
      let Result = MAM.create(this.MAM_Object, "");
      if(this.OriginalRoot == null) {
        this.OriginalRoot = Result.root;
      }
      this.MAM_Object = MAM_Message.state;
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
    return this.OriginalRoot;
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
    //console.log(this.MAM_Object);
    let MAM_Message = MAM.create(this.MAM_Object, IOTA_Object.utils.toTrytes(a_Message));
    this.MAM_Object = MAM_Message.state;
    if(this.OriginalRoot == null) {
      this.OriginalRoot = this.MAM_Object.root;
    }
    this.CurrentRoot = this.MAM_Object.root;
    this.NextRoot = this.MAM_Object.state.channel.next_root;
    //console.log(this.MAM_Object);
    return MAM.attach(MAM_Message.payload, MAM_Message.address);
  }

  static FetchSingleTransaction() {

  }

  static FetchStreamRaw(a_Root, a_PrivacyLevel, a_Sidekey) {
      return MAM.fetch(a_Root, a_PrivacyLevel, a_Sidekey);
  }

  static FetchStream() {

  }

  //Decode
  static Decode(a_Transaction) {
    return MAM.decode(a_Payload, a_Sidekey, a_Root);
  }
}

class MAM_Reader {
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
}
//USER - Proof

//USER - AddClaim

//Issuer - AddClaim

//Issuer - RevokeClaim


//Test
let Masked = new MAM_Publisher(IOTA_Object, 'OFHVJCOMRYWA9HXQKMNSZOHLFXEMZZWOQ9O9SSPPFQGMXWUCEYUSCCLLXDJYYYZLJHTUJZLLFBTOAWBTA', 1, PRIVACYLEVEL.public);
Masked.CatchupChannel(2);
