import React, { useState, useEffect, createContext } from "react";

export const XrplContext = createContext();

const xrpl = require("xrpl");

export const XrplContextProvider = ({ children }) => {
  const [standbyAccount, setStandbyAccount] = useState({
    address: "",
    publicKey: "",
    privateKey: "",
    balance: "",
    seed: "",
    amount: "",
    destination: "",
    currency: "",
    defaultRippleSetting: true,
  });
  const [operationalAccount, setOperationalAccount] = useState({
    address: "",
    publicKey: "",
    privateKey: "",
    balance: "",
    seed: "",
    amount: "",
    destination: "",
    currency: "",
    defaultRippleSetting: true,
  });

  const getStandbyAccount = async () => {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();
    const my_wallet = (await client.fundWallet()).wallet;
    const balance = await client.getXrpBalance(my_wallet.address);

    setStandbyAccount({
      address: my_wallet.address,
      publicKey: my_wallet.publicKey,
      privateKey: my_wallet.privateKey,
      balance: balance,
      seed: my_wallet.seed,
    });

    client.disconnect();
  };

  const getOperationalAccount = async () => {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();
    const my_wallet = (await client.fundWallet()).wallet;
    console.log(my_wallet);
    const balance = await client.getXrpBalance(my_wallet.address);

    setOperationalAccount({
      address: my_wallet.address,
      publicKey: my_wallet.publicKey,
      privateKey: my_wallet.privateKey,
      balance: balance,
      seed: my_wallet.seed,
    });
    client.disconnect();
  };
  console.log(standbyAccount);
  console.log(operationalAccount);

  const getStandbyAccountFromSeeds = async () => {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    const standby_wallet = xrpl.Wallet.fromSeed(standbyAccount.seed);
    const balance = await client.getXrpBalance(standby_wallet.address);

    setStandbyAccount({
      address: standby_wallet.address,
      publicKey: standby_wallet.publicKey,
      privateKey: standby_wallet.privateKey,
      balance: balance,
      seed: standby_wallet.seed,
    });

    client.disconnect();
  };

  const getOPAccountFromSeeds = async () => {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    const operational_wallet = xrpl.Wallet.fromSeed(operationalAccount.seed);
    const balance = await client.getXrpBalance(operational_wallet.address);

    setOperationalAccount({
      address: operational_wallet.address,
      publicKey: operational_wallet.publicKey,
      privateKey: operational_wallet.privateKey,
      balance: balance,
      seed: operational_wallet.seed,
    });

    client.disconnect();
  };

  const sendXRP = async () => {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    const send_wallet = xrpl.Wallet.fromSeed(standbyAccount.seed);
    const receive_wallet = xrpl.Wallet.fromSeed(operationalAccount.seed);

    const request = await client.autofill({
      TransactionType: "Payment",
      Account: send_wallet.address,
      Amount: xrpl.xrpToDrops(standbyAccount.amount),
      Destination: standbyAccount.destination,
    });

    const signed = send_wallet.sign(request);
    const tx = await client.submitAndWait(signed.tx_blob);

    const sent_wallet_balance = await client.getXrpBalance(send_wallet.address);
    const receive_wallet_balance = await client.getXrpBalance(
      receive_wallet.address
    );

    setStandbyAccount({ ...standbyAccount, balance: sent_wallet_balance });
    setOperationalAccount({
      ...operationalAccount,
      balance: receive_wallet_balance,
    });

    client.disconnect();
  };

  const oPsendXRP = async () => {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    const send_wallet = xrpl.Wallet.fromSeed(operationalAccount.seed);
    const receive_wallet = xrpl.Wallet.fromSeed(standbyAccount.seed);

    const request = await client.autofill({
      TransactionType: "Payment",
      Account: send_wallet.address,
      Amount: xrpl.xrpToDrops(operationalAccount.amount),
      Destination: operationalAccount.destination,
    });

    const signed = send_wallet.sign(request);
    const tx = await client.submitAndWait(signed.tx_blob);

    const sent_wallet_balance = await client.getXrpBalance(
      receive_wallet.address
    );
    const receive_wallet_balance = await client.getXrpBalance(
      send_wallet.address
    );

    setStandbyAccount({ ...standbyAccount, balance: sent_wallet_balance });
    setOperationalAccount({
      ...operationalAccount,
      balance: receive_wallet_balance,
    });

    client.disconnect();
  };

  // *******************************************************
  // **************** Configure Account ********************
  // *******************************************************

  const configureStandbyAccount = async (defaultRippleSetting) => {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    let my_wallet = xrpl.Wallet.fromSeed(standbyAccount.seed);

    let settings_tx = {};
    if (defaultRippleSetting) {
      settings_tx = {
        TransactionType: "AccountSet",
        Account: my_wallet.address,
        SetFlag: xrpl.AccountSetAsfFlags.asfDefaultRipple,
      };
    } else {
      settings_tx = {
        TransactionType: "AccountSet",
        Account: my_wallet.address,
        ClearFlag: xrpl.AccountSetAsfFlags.asfDefaultRipple,
      };
      const prepared = await client.autofill(settings_tx);
      const signed = my_wallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);
      if (result.result.meta.TransactionResult == "tesSUCCESS") {
        console.log(result);
      } else {
        throw "Error sending transaction: ${result}";
      }

      client.disconnect();
    }
  };

  const configureOPAccount = async (defaultRippleSetting) => {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    let my_wallet = xrpl.Wallet.fromSeed(operationalAccount.seed);

    let settings_tx = {};
    if (defaultRippleSetting) {
      settings_tx = {
        TransactionType: "AccountSet",
        Account: my_wallet.address,
        SetFlag: xrpl.AccountSetAsfFlags.asfDefaultRipple,
      };
    } else {
      settings_tx = {
        TransactionType: "AccountSet",
        Account: my_wallet.address,
        ClearFlag: xrpl.AccountSetAsfFlags.asfDefaultRipple,
      };
      const prepared = await client.autofill(settings_tx);
      const signed = my_wallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);
      if (result.result.meta.TransactionResult == "tesSUCCESS") {
        console.log(result);
      } else {
        throw "Error sending transaction: ${result}";
      }

      client.disconnect();
    }
  };

  // *******************************************************
  // ***************** Create TrustLine ********************
  // *******************************************************

  const createTrustLine = async () => {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    const standby_wallet = xrpl.Wallet.fromSeed(standbyAccount.seed);
    const operational_wallet = xrpl.Wallet.fromSeed(operationalAccount.seed);

    const trustSet_tx = {
      TransactionType: "TrustSet",
      Account: standbyAccount.amount,
      LimitAmount: {
        currency: standbyAccount.currency,
        issuer: standby_wallet.address,
        value: standbyAmountField.value,
      },
    };
    const ts_prepared = await client.autofill(trustSet_tx);
    const ts_signed = operational_wallet.sign(ts_prepared);
    const ts_result = await client.submitAndWait(ts_signed.tx_blob);
    if (ts_result.result.meta.TransactionResult == "tesSUCCESS") {
      console.log("Create trust line is succeed");
    } else {
      console.error("Something wrong on trust line");
    }
  };
  // *******************************************************
  // *************** Send Issued Currency ******************
  // *******************************************************

  const sendCurrency = async () => {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    const standby_wallet = xrpl.Wallet.fromSeed(standbyAccount.seed);
    const operational_wallet = xrpl.Wallet.fromSeed(operationalAccount.seed);

    const send_token_tx = {
      TransactionType: "Payment",
      Account: standby_wallet.address,
      Amount: {
        currency: standbyAccount.currency,
        value: standbyAccount.amount,
        issuer: standby_wallet.address,
      },
      Destination: standbyAccount.destination,
    };

    const pay_prepared = await client.autofill(send_token_tx);
    const pay_signed = standby_wallet.sign(pay_prepared);
    const pay_result = await client.submitAndWait(pay_signed.tx_blob);

    if (pay_result.result.meta.TransactionResult == "tesSUCCESS") {
      console.log("Create trust line is succeed");
    } else {
      console.error("Something wrong on trust line");
    }

    getBalances();

    client.disconnect();
  };

  // *******************************************************
  // ****************** Get Balances ***********************
  // *******************************************************

  const getBalances = async () => {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    const standby_wallet = xrpl.Wallet.fromSeed(standbyAccount.seed);
    const operational_wallet = xrpl.Wallet.fromSeed(operationalAccount.seed);
    const standby_balances = await client.request({
      command: "gateway_balances",
      account: standby_wallet.address,
      ledger_index: "validated",
      hotwallet: [operational_wallet.address],
    });
    console.log(JSON.stringify(standby_balances.result, null, 2));

    const operational_balances = await client.request({
      command: "gateway_balances",
      account: operational_wallet.address,
      ledger_index: "validated",
    });
    console.log(JSON.stringify(operational_balances.result, null, 2));

    const standByBalance = await client.getXrpBalance(standby_wallet.address);
    const oPBalance = await client.getXrpBalance(operational_wallet.address);
    setStandbyAccount({ ...standbyAccount, balance: standByBalance });
    setOperationalAccount({ ...operationalAccount, balance: oPBalance });

    client.disconnect();
  };

  return (
    <XrplContext.Provider
      value={{
        standbyAccount,
        setStandbyAccount,
        operationalAccount,
        setOperationalAccount,
        getStandbyAccount,
        getOperationalAccount,
        sendXRP,
        oPsendXRP,
        getStandbyAccountFromSeeds,
        getOPAccountFromSeeds,
        configureStandbyAccount,
        configureOPAccount,
        createTrustLine,
        sendCurrency,
      }}
    >
      {children}
    </XrplContext.Provider>
  );
};
