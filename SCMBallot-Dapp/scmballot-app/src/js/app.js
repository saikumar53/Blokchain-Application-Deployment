App = {
  web3Provider: null,
  contracts: {},
  PTproposals: new Array(),
  FMproposals: new Array(),
  STproposals: new Array(),
  OAproposals: new Array(),
  url: 'http://127.0.0.1:7545',
  chairPerson:null,
  _dec : 0,
  _state : 0,
  States: {
      "0": "Add",
      "1": "Register",
      "2": "Voting",
      "3": "Results",
  },
  Decisions: {
    "0": "Friendly_Games",
    "1": "Player_Transfers",
    "2": "Game_Strategies",
    "3": "Other_Club_Activites",
  },
  currentAccount:null,
  init: function() {
    return App.initWeb3();
 },

//web3 initialization
 initWeb3: function() {
       // Is there is an injected web3 instance?
   if (typeof web3 !== 'undefined') {
     App.web3Provider = web3.currentProvider;
   } else {
     // If no injected web3 instance is detected, fallback to the TestRPC
     App.web3Provider = new Web3.providers.HttpProvider(App.url);
   }
   web3 = new Web3(App.web3Provider);

   console.log(web3);
   ethereum.enable();

   App.populateAddress();
   return App.initContract();

 },

//Contract Initialization
 initContract: function() {
     $.getJSON('SCMBallot.json', function(data) {
   // Get the necessary contract artifact file and instantiate it with truffle-contract
   var voteArtifact = data;
   App.contracts.vote = TruffleContract(voteArtifact);
   console.log();

   // Set the provider for our contract
   App.contracts.vote.setProvider(App.web3Provider);

   App.getChairperson();
   return App.bindEvents();
 });
 },

//Bind Functions
 bindEvents: function() {
   $(document).on('click', '#register', function(){ var ad = $('#enter_address').val(); var val = $('#number_of_Votes').val() ;App.handleRegister(ad,val); });
   $(document).on('click', '#Proposals', function(){ var p1 = $('#PlayerTra').val(); App.PTprop(p1); var p2 = $('#FriendlyG').val(); App.FMprop(p2);
                                                  var p3 = $('#Strategy').val(); App.Stratprop(p3); var p4 = $('#OtherActivities').val(); App.OAprop(p4)});
   $(document).on('click', '#switch-button', function(){App.switchto()});
   $(document).on('click', '#PTVote',function(){var v1 = parseInt($('#PTselect').val()) - 1;App.Vote(v1.toString())});
   $(document).on('click', '#GSVote', function(){var v2 = parseInt($('#STselect').val()) - 1;App.Vote(v2.toString())});
   $(document).on('click', '#FGVote', function(){var v3 = parseInt($('#FMselect').val()) - 1;App.Vote(v3.toString())});
   $(document).on('click', '#OAVote', function(){var v4 = parseInt($('#OAselect').val()) - 1;App.Vote(v4.toString())});
   $(document).on('click', '#PTwin-count', App.PTWinner);
   $(document).on('click', '#FGwin-count', App.FGWinner);
   $(document).on('click', '#STwin-count', App.STWinner);
   $(document).on('click', '#OAwin-count', App.OAWinner);
   $(document).on('click', '#decision', App.Voting_Decision);
   $(document).on('click', '#State', App.Act_State);
 },

//Owner address not displaying in the drop down list in web page
 getChairperson : function(){
   App.contracts.vote.deployed().then(function(instance) {
     return instance;
   }).then(function(result) {
     App.chairPerson = result.constructor.currentProvider.selectedAddress.toString();
     App.currentAccount = web3.eth.coinbase;
     if(App.chairPerson != App.currentAccount){
       jQuery('#address_div').css('display','none');
       jQuery('#register_div').css('display','none');
     }else{
       jQuery('#address_div').css('display','block');
       jQuery('#register_div').css('display','block');
     }
   })
 },

//populating the addresses with accounts
 populateAddress : function(){
   new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts((err, accounts) => {
     jQuery.each(accounts,function(i){
       if(web3.eth.coinbase != accounts[i]){
         var optionElement = '<option value="'+accounts[i]+'">'+accounts[i]+'</option';
         jQuery('#enter_address').append(optionElement);
       }
     });
   });
 },

//Calling the Register function of SC
 handleRegister: function(addr,val){
   var voteInstance;
   App.contracts.vote.deployed().then(function(instance) {
     voteInstance = instance;
     return voteInstance.Auth_Num_Votes(addr,val);
   }).then(function(result, err){
        console.log(result);
       if(result){
           if(parseInt(result.receipt.status) == 1)
              alert(addr + " registration done successfully")
           else
              alert(addr + " registration not done successfully due to revert")
       } else {
           alert(addr + " registration failed")
       }
   });
 },

//Giving proposals and Loading the choices of Player Transfer
 PTprop: function(p1){
   var propInstance;
   var loader = $("#loader3");
   var content = $("#content3");

   loader.show();
   content.hide();
   App.contracts.vote.deployed().then(function(instance){
     propInstance  = instance;
     return propInstance.PlayerTransfer(p1)
   }).then(function(result,err){
        if(result){
            if(parseInt(result.receipt.status) == 1){
            alert("Player Transfer proposals assigned sucessfully")

            var PTchoices = $('#PTchoices');
            PTchoices.empty();

            var PTselect = $('#PTselect');
            PTselect.empty();

            for( var i = 1; i <= p1; i++){
              var id = i;
              var name = "Choice_"+i.toString();

              App.PTproposals.push(i);

              var choiceTemplate = "<tr><th>" + id  + "</th><td>" + name + "</td></tr>"
              PTchoices.append(choiceTemplate);

              var PToption = "<option value='" + id + "' >" + name + "</ option>"
              PTselect.append(PToption);
            }
            loader.hide();
            content.show();}
            else
            alert("Player Transfer proposals assignment failed due to revert")
          }else{
            alert("Player Transfer proposals assignment failed")
          }
        }
   );
 },

//Giving proposals and Loading the choices of Friendly Games
 FMprop: function(p2){
   var propInstance;
   var loader = $("#loader");
   var content = $("#content");

   loader.show();
   content.hide();

   App.contracts.vote.deployed().then(function(instance){
     propInstance  = instance;
     return propInstance.FriendlyMt(p2)
   }).then(function(result,err){
        if(result){
            if(parseInt(result.receipt.status) == 1){
            alert("Friendly Games proposals assigned sucessfully");

             var FMchoices = $('#FMchoices');
             FMchoices.empty();

             var FMselect = $('#FMselect');
             FMselect.empty();

             for( var i = 1; i <= p2; i++){
               var id = i;
               var name = "Choice_"+i.toString();

                App.FMproposals.push(i);

               var choiceTemplate = "<tr><th>" + id  + "</th><td>" + name + "</td></tr>"
               FMchoices.append(choiceTemplate);

               var FMoption = "<option value='" + id + "' >" + name + "</ option>"
               FMselect.append(FMoption);
             }
             loader.hide();
             content.show();}
            else
            alert("Friendly Games proposals assignment failed due to revert")
          }else{
            alert("Friendly Games proposals assignment failed")
          }
        }
   );
 },

//Giving proposals and Loading the choices of Game Strategies
 Stratprop: function(p3){
   var propInstance;
   var loader = $("#loader2");
   var content = $("#content2");

   loader.show();
   content.hide();
   App.contracts.vote.deployed().then(function(instance){
     propInstance  = instance;
     return propInstance.Strategy(p3)
   }).then(function(result,err){
        if(result){
            if(parseInt(result.receipt.status) == 1){
              alert("Strategy proposals assigned sucessfully");

            var Stchoices = $('#Stchoices');
            Stchoices.empty();

            var STselect = $('#STselect');
            STselect.empty();

            for( var i = 1; i <= p3; i++){
              var id = i;
              var name = "Choice_"+i.toString();

              App.STproposals.push(i);

              var choiceTemplate = "<tr><th>" + id  + "</th><td>" + name + "</td></tr>"
              Stchoices.append(choiceTemplate);

              var SToption = "<option value='" + id + "' >" + name + "</ option>"
              STselect.append(SToption);
            }
            loader.hide();
            content.show();
            }
            else
            alert("Strategy proposals assignment failed due to revert")
          }else
            alert("Strategy proposals assignment failed")
        }
   );
 },

 ////Giving proposals and Loading the choices of Other Club Activities
 OAprop: function(p4){
   var propInstance;
   var loader = $("#loader4");
   var content = $("#content4");

   loader.show();
   content.hide();
   App.contracts.vote.deployed().then(function(instance){
     propInstance  = instance;
     return propInstance.Other_ClubA(p4)
   }).then(function(result,err){
        if(result){
            if(parseInt(result.receipt.status) == 1){
              alert("Other Club Activities proposals assigned sucessfully");

            var OAchoices = $('#OAchoices');
            OAchoices.empty();

            var OAselect = $('#OAselect');
            OAselect.empty();

            for( var i = 1; i <= p4; i++){
              var id = i;
              var name = "Choice_"+i.toString();
              App.OAproposals.push(i);

              var choiceTemplate = "<tr><th>" + id  + "</th><td>" + name + "</td></tr>"
              OAchoices.append(choiceTemplate);

              var OAoption = "<option value='" + id + "' >" + name + "</ option>"
              OAselect.append(OAoption);
            }
            loader.hide();
            content.show();
            }
            else
            alert("Strategy proposals assignment failed due to revert")
          }else
            alert("Strategy proposals assignment failed")
        }
   );
 },

//Switch function to change to other club decision while voting
 switchto: function() {
   // var _dec;
    var s = $('#change').val();
    if(s == 'Friendly_Games'){App._dec = 0;}
    else if(s == 'Player_Transfers'){App._dec = 1;}
    else if(s == 'Game_Strategies'){App._dec = 2;}
    else {App._dec = 3;}
    console.log(s);
    App.contracts.vote.deployed().then(function(instance) {
      return instance.Switch(App._dec);
    }).then(function(result,err) {
      if(result){
            if(parseInt(result.receipt.status) == 1)
                alert(" Voting State successfully switched to "+s)
            else
                alert("Voting not changed due to revert")
        } else {
            alert("Operation failed")
        }
    });
  },

//Vote function
   Vote: function(choice) {
     var voteInstance;
     console.log(choice);
     web3.eth.getAccounts(function(error, accounts){
       var account = accounts[0];
       $("#accountAddress").html("Your Account: " + account);
       App.contracts.vote.deployed().then(function(instance) {
         voteInstance = instance;

         return voteInstance.castVote(choice, {from: account});
       }).then(function(result, err){
             if(result){
                 console.log(result.receipt.status);
                 if(parseInt(result.receipt.status) == 1)
                 alert(account + " voting done successfully")
                 else
                 alert(account + " voting not done successfully due to revert")
             } else {
                 alert(account + " voting failed")
             }
         });
       });
   },

//Player Transfer best choice
   PTWinner : function() {
     var voteInstance;
     App.contracts.vote.deployed().then(function(instance) {
       voteInstance = instance;
       return voteInstance.BestPlayerT();
     }).then(function(res){
     console.log(res);
       alert("Best Player Transfer Decision is Choice_"+App.PTproposals[res]);
     }).catch(function(err){
       console.log(err.message);
     })
   },

//Friendly Games best choice
   FGWinner : function() {
     var voteInstance;
     App.contracts.vote.deployed().then(function(instance) {
       voteInstance = instance;
       return voteInstance.BestFriendlyM();
     }).then(function(res){
     console.log(res);
       alert("Best Friendly Match Decision is Choice_"+App.FMproposals[res]);
     }).catch(function(err){
       console.log(err.message);
     })
   },

//Game Strategies best choice
   STWinner : function() {
     var voteInstance;
     App.contracts.vote.deployed().then(function(instance) {
       voteInstance = instance;
       return voteInstance.BestStrategy();
     }).then(function(res){
     console.log(res);
       alert("Best Strategy Decision is Choice_"+App.STproposals[res]);
     }).catch(function(err){
       console.log(err.message);
     })
   },

//Other Club Activities best choice
   OAWinner : function() {
     var voteInstance;
     App.contracts.vote.deployed().then(function(instance) {
       voteInstance = instance;
       return voteInstance.BestOtherClubA();
     }).then(function(res){
     console.log(res);
       alert("Best Other Club Activity is Choice_"+App.OAproposals[res]);
     }).catch(function(err){
       console.log(err.message);
     })
   },

//Checking the voting decision state
   Voting_Decision: function() {
     if(App._state == 2){
     alert("You are in "+App.Decisions[App._dec]+" Voting State ");
   }
   else {
     alert("Voting State has not been started");
   }
   },

   //checking the actual state in the process
   Act_State: function(){
    App.contracts.vote.deployed().then(function(instance) {
      return instance.currentPhase();
    }).then(function(res){
      App._state = res;
     console.log(App._state);
     alert("You are in "+App.States[App._state]+" State ");
   });
   }

};

//Initialising the app
$(function() {
 $(window).load(function() {
   App.init();
 });
});
