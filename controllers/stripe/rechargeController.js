import CustomErrorHandler from "../../services/CustomErrorHandler";
import { STRIPE_SECRET_KEY } from "../../config";
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const rechargeController = {
  //create customers
  async store(req, res, next) {
    let documents, user, charge;
    console.log("admin controller");
    const { amount, currency, description, source } = req.body;
    try {
      if (!amount || !currency || !description) {
        res.status(422).json("Please add all requirements");
      }
      // if (req.params.cus_id && source) {
      //   documents = await stripe.customers.retrieveSource(
      //     req.params.cus_id,
      //     source
      //   );
      //   console.log("documents", documents);
      // }
      // await stripe.tokens
      //   .create({
      //     card: {
      //       number: 5354564604377230,
      //       exp_month: documents.exp_month,
      //       exp_year: documents.exp_year,
      //       cvc: documents.cvc,
      //     },
      //   })
      // .then(async (response) => {
      //   console.log("res", response);
      //   console.log("res", response.id);
      if (source) {
        // const response = await stripe.customers.createSource(
        //   req.params.cus_id,
        //   {
        //     source: source,
        //   }
        // );
        // console.log("data.......", data);
        charge = await stripe.charges.create({
          amount: amount * 100,
          currency: currency,
          customer: req.params.cus_id,
          source: source,
          description: description,
        });
        console.log("first..", charge);
      }
      // });

      res.status(200).json(charge);
    } catch (err) {
      console.log("err", err);
      res.status(err.statusCode).json({
        message: err.message,
        statusCode: err.statusCode,
        success: false,
        data: null,
        stack: err.stack,
      });
    }
    console.log("users", documents);
    // res.status(201).json(documents);
  },

  //get particular customer
  async show(req, res, next) {
    let documents;
    console.log("hello", req.params.id);
    try {
      if (req.params.id) {
        documents = await stripe.customers.retrieve(req.params.id, {
          expend: ["default_source"],
        });
      } else {
        return next(CustomErrorHandler.emptyState());
      }
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    console.log("users", documents);
    res.status(201).json(documents);
  },
  async update(req, res, next) {
    let documents;
    console.log("admin controller");
    try {
      documents = await stripe.customers.update(req.params.id, {
        balance: req.body.balance,
      });
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    console.log("user update", documents);
    res.status(201).json(documents);
  },
};

export default rechargeController;
