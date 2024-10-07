const Diamond = artifacts.require("./Diamond.sol");

module.exports = function(deployer) {
    deployer.deploy(Diamond);
};