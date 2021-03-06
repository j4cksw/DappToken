App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

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

        App.listenForEvents();

        return App.render();
      });
    });
  },

  listenForEvents: async () => {
    let saleInstance = await App.contracts.DappTokenSale.deployed();
    console.log(saleInstance);
    saleInstance.Sell({
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, event) => {
        console.log("event triggered", event);
        App.render();
    });
  },

  render: async () => {
    if (App.loading) {
      return;
    }

    App.loading = true;

    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    App.account = account;
    $("#accountAddress").html("Your address: " + account);

    let saleInstance = await App.contracts.DappTokenSale.deployed();
    
    App.tokenPrice = await saleInstance.tokenPrice();
    $('.token-price').html(web3.utils.fromWei(App.tokenPrice, "ether"));

    App.tokensSold = await saleInstance.tokenSold();
    $('.tokens-sold').html(App.tokensSold.toNumber());
    $('.tokens-available').html(App.tokensAvailable);
    
    let progressPercent = App.tokensSold.toNumber() / App.tokensAvailable * 100;
    $('#progress').css('width', progressPercent + '%');

    let tokenInstance = await App.contracts.DappToken.deployed();
    tokenInstance.balanceOf(account).then((balance) => {
        $('.dapp-balance').html(balance.toNumber());
    }).catch((error)=>{ 
        $('.dapp-balance').html(0);
    });
    

    App.loading = false;
    loader.hide();
    content.show();
  },

  buyTokens: async () => {
      $('#content').hide();
      $('#loader').show();

      let numberOfTokens = $('#numberOfTokens').val();
      let tokenSaleInstance = await App.contracts.DappTokenSale.deployed();
      let result = await tokenSaleInstance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000
      });
      console.log("Tokens bought...");
      $('form').trigger('reset');
  }
};

$(() => {
  App.init();
});
