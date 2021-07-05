App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: () => {
    console.log("App initialized");
    return App.initWeb3();
  },

  initWeb3: () => {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }

    return App.initCopntracts();
  },

  initCopntracts: async () => {
    $.getJSON("DappTokenSale.json", (dappTokenSale) => {
      App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
      App.contracts.DappTokenSale.setProvider(App.web3Provider);
      App.contracts.DappTokenSale.deployed().then((dappTokenSale) => {
        console.log("Dapp Token sale address:", dappTokenSale.address);
      });
    }).done(() => {
      $.getJSON("DappToken.json", (dappToken) => {
        App.contracts.DappToken = TruffleContract(dappToken);
        App.contracts.DappToken.setProvider(App.web3Provider);
        App.contracts.DappToken.deployed().then((dappToken) => {
          console.log("Dapp Token address:", dappToken.address);
        });

        return App.render();
      });
    });
  },

  render: async () => {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    const account = accounts[0];
    console.log(account);
    $('#accountAddress').html("Your address: " + account);
  }
};

$(() => {
  App.init();
});
