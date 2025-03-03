import { Router } from "express";
import { cancelSubscription, createSubscription, deleteSubscription, getAllSubscriptions, getSubscription, getUserSubscriptions, updateSubscription } from "../controllers/subscription.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();


subscriptionRouter.get('/', getAllSubscriptions);

subscriptionRouter.get('/:id', authorize, getSubscription);

subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.put('/:id', authorize, updateSubscription);


subscriptionRouter.delete('/:id', authorize, deleteSubscription);

subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

subscriptionRouter.put('/:id/cancel', authorize, cancelSubscription);

subscriptionRouter.get('upcoming-renewals', (req, res) => res.send({
    title: 'GET upcoming renewals'
}));

export default subscriptionRouter;