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
        assert.equal(success, true, "should return true on transfer success");
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

  it("Approves tokens for delegated transfer", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;

        return tokenInstance.approve.call(accounts[1], 100);
      })
      .then((success) => {
        assert.equal(success, true, "Should return true");

        return tokenInstance.approve(accounts[1], 100);
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "trigger once");
        assert.equal(
          receipt.logs[0].event,
          "Approval",
          "should be the approval event"
        );
        assert.equal(
          receipt.logs[0].args._owner,
          accounts[0],
          "logs the account the tokens are authorized by"
        );
        assert.equal(
          receipt.logs[0].args._spender,
          accounts[1],
          "logs the account the tokens are authorized to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          100,
          "logs the transfer amount"
        );

        return tokenInstance.allowance(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.equal(
          allowance.toNumber(),
          100,
          "stores the allowance for delegated transfer."
        );
      });
  });

  it("handles delegated token transfers", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        fromAccount = accounts[2];
        toAccount = accounts[3];
        spendingAccount = accounts[4];
        // Transfer some tokens to fromAccount
        return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
      })
      .then((receipt) => {
        // Approve spendingAccount to spend 10 tokens from fromAccount
        return tokenInstance.approve(spendingAccount, 10, {
          from: fromAccount,
        });
      })
      .then((receipt) => {
        // Try transferring something larger than the sender's balance
        return tokenInstance.transferForm(fromAccount, toAccount, 9999, {
          from: spendingAccount,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        //console.log(error.message)
        assert(
          error.message.indexOf("revert") >= 0,
          "can not transfer value larger than balance."
        );

        // Try transferring something larger than the approved amount
        return tokenInstance.transferForm(fromAccount, toAccount, 20, {
          from: spendingAccount,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        // console.log(error.message)
        assert(
          error.message.indexOf("revert") >= 0,
          "can not transfer value larger than approved amount."
        );

        return tokenInstance.transferForm.call(fromAccount, toAccount, 10, {
          from: spendingAccount,
        });
      })
      .then((success) => {
        assert.equal(success, true);

        return tokenInstance.transferForm(fromAccount, toAccount, 10, {
          from: spendingAccount,
        });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "trigger once");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          'should be the "Transfer" event.'
        );
        assert.equal(
          receipt.logs[0].args._from,
          fromAccount,
          "logs the account the tokens are transferred from"
        );
        assert.equal(
          receipt.logs[0].args._to,
          toAccount,
          "logs the account the tokns are transferred to."
        );
        assert.equal(
          receipt.logs[0].args._value,
          10,
          "logs the transfer amount."
        );

        return tokenInstance.balanceOf(fromAccount);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          90,
          "deduct the amount from the sending account."
        );

        return tokenInstance.balanceOf(toAccount);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          10,
          "adds the amount to the receiving account"
        );

        return tokenInstance.allowance(fromAccount, spendingAccount);
      })
      .then((allowance) => {
        assert.equal(
          allowance.toNumber(),
          0,
          "deducts the amount from the allowance"
        );
      });
  });
});
