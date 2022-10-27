import { Payment, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { STRIPE_SECRET_KEY } from "../../config";
import { HTTP_STATUS } from "../../utils/constants";
import {
  constructResponse,
  errorResponse,
  successResponse,
} from "../../utils/response";

const stripe = require("stripe")(STRIPE_SECRET_KEY);

const usersController = {
  //create customers
  async store(req, res, next) {
    let documents;
    let user;
    try {
      const { name, email, phone } = req.body;
      if (!name || !email || !phone) {
        return errorResponse(
          res,
          HTTP_STATUS.NOT_ACCEPTABLE,
          "All Fields Are Required!"
        );
      }
      documents = await stripe.customers.create({
        name: name,
        email: email,
        phone: phone,
      });
      if (documents) {
        const isExist = await Payment.findOne({ user: req.user._id });
        if (!isExist) {
          user = await Payment.create({
            user: req.user._id,
            cus_id: documents.id,
          });
        } else {
          user = await Payment.updateOne(
            { user: req.user._id },
            {
              cus_id: documents.id,
            },
            { new: true }
          );
        }
        return successResponse(
          res,
          next,
          documents,
          HTTP_STATUS.CREATED,
          "Stripe customer created successfully..."
        );
      }
    } catch (err) {
      return next(err);
    }
  },
  //get all customers
  async index(req, res, next) {
    let documents;
    try {
      documents = await stripe.customers.list({});
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    console.log("users", documents);
    return successResponse(
      res,
      next,
      documents,
      HTTP_STATUS.OK,
      "Stripe All Customers Found Successfully!"
    );
  },

  //get particular customer
  async show(req, res, next) {
    let documents;
    console.log("hello", req.params.id);
    try {
      if (req.params.id) {
        documents = await stripe.customers.retrieve(req.params.id);
      } else {
        return next(CustomErrorHandler.emptyState());
      }
    } catch (err) {
      return next(err);
    }
    console.log("users", documents);
    return successResponse(
      res,
      next,
      documents,
      HTTP_STATUS.OK,
      "Stripe Customer Found Successfully!"
    );
  },
  //update customer
  async update(req, res, next) {
    let documents;
    try {
      documents = await stripe.customers.update(req.params.id, {
        balance: req.body.balance,
      });
    } catch (err) {
      return next(err);
    }
    console.log("user update", documents);
    return successResponse(
      res,
      next,
      documents,
      HTTP_STATUS.CREATED,
      "Stripe Customer Updated Successfully!"
    );
  },
  async destroy(req, res, next) {
    let documents;
    try {
      documents = await stripe.customers.del(req.params.id);
    } catch (err) {
      return next(err);
    }
    console.log("user update", documents);
    return constructResponse(res, {
      status: HTTP_STATUS.OK,
      message: "Stripe Customer Deleted Successfully!",
    });
  },

  async balance(req, res, next) {
    let documents;
    console.log("balance transaction");
    try {
      // documents = await stripe.customers.del(req.params.id);
      documents = await stripe.customers.retrieveBalanceTransaction(
        req.params.cus_id,
        req.params.balance_tr_id
      );
    } catch (err) {
      res.status(err.statusCode).json({
        message: err.message,
        statusCode: err.statusCode,
        success: false,
        data: null,
        stack: err.stack,
      });
    }
    console.log("user update", documents);
    res.status(201).json(documents);
  },
};

export default usersController;
