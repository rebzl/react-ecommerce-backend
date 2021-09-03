const User = require("../models/user");
const braintree = require("braintree");
require("dotenv").config();

/**
 * Connect with braintree
 * braintree.Environment.Sandbox = sandbox, when what to go to production, change the Sandbox to Production
 * Can use this to generate a token
 */
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

/**
 *
 * @param {*} req
 * @param {*} res
 * Returns generated token or error
 */
exports.generateToken = (req, res) => {
  gateway.clientToken.generate({}, function (err, response) {
    if (err) {
      res.status(500).send(err);
    } else {
      // response is the generated token
      res.send(response);
    }
  });
};

/**
 * Process transation to braintree
 * @param {*} req
 * @param {*} res
 */
exports.processPayment = (req, res) => {
  let nonceFromTheClient = req.body.paymentMethodNonce;
  let amountFromTheClient = req.body.amount;
  // Charge the user
  // sale((amount and payment token info), (callback, if it is error ->return error, if success -> return success))
  let newTransaction = gateway.transaction.sale(
    {
      amount: amountFromTheClient,
      paymentMethodNonce: nonceFromTheClient,
      options: {
        submitForSettlement: true,
      },
    },
    (error, result) => {
      if (error) {
        res.status(500).json(error);
      } else {
        res.json(result);
      }
    }
  );
};
