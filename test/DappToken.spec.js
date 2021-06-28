const DappToken = artifacts.require("./DappToken.sol");

contract("DappToken", (accounts) => {
  it("initialize the contract with the correct value", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then((name) => {
        assert.equal(name, "Dapp Token", "Name should be 'DappToken'");
        return tokenInstance.symbol();
      })
      .then((symbol) => {
        assert.equal(symbol, "DAPP", "Symbol should be 'DAPP'.");
        return tokenInstance.standard();
      })
      .then((standard) => {
        assert.equal(standard, "Dapp Token v1.0", "Has the correct standard.");
      });
  });

  it("allocates the total supply upon deployment", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then((totalSupply) => {
        assert.equal(
          totalSupply.toNumber(),
          1000000,
          "Total supply should be 1,000,000 at the beginning."
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then((adminBalance) => {
        assert.equal(
          adminBalance.toNumber(),
          1000000,
          "It should allocate all of the initial supply to admin."
        );
      });
  });

  it("Transfer token ownership", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        //Test 'require' statement first by transferring something larger than the sender's balance
        return tokenInstance.transfer.call(accounts[1], 999999999999);
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "error message must contain revert"
        );
        return tokenInstance.transfer.call(accounts[1], 250000, {
          from: accounts[0],
        });
      })
      .then((success) => {
          assert.equal(success, true, 'should return true on transfer success');
        return tokenInstance.transfer(accounts[1], 250000, {
          from: accounts[0],
        });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "Should trigger only once");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          'Should be the "Trigger" event'
        );
        assert.equal(
          receipt.logs[0].args._from,
          accounts[0],
          "logs the account the tokens are transferred from"
        );
        assert.equal(
          receipt.logs[0].args._to,
          accounts[1],
          "logs the account the tokens are trensferred to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          250000,
          "logs the transfer amount"
        );
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          250000,
          "adds the amount to the receiving account."
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          750000,
          "deducts the amount from the sending account."
        );
      });
  });
});
