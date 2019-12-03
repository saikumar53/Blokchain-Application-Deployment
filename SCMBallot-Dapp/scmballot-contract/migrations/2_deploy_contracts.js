var SCMBallot = artifacts.require("SCMBallot.sol");

//Number of Voters given is 2, it can be changed to other value and works fine
module.exports = function(deployer){
deployer.deploy(SCMBallot,2)
};
