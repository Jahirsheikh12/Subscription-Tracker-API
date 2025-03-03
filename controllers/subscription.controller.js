import Subscription from '../models/subscription.model.js';

import { workflowClient } from '../config/upstash.js'
import { SERVER_URL } from '../config/env.js';

// create subscription controller
export const createSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,
        });

        const { workflowRunId } = await workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            body: {
                subscriptionId: subscription.id,

            },
            headers: {
                'content-type': 'application/json',
            },
            retries: 0,
        })

        res.status(201).json({
            success: true,
            message: "Subscription created successfully",
            data: {
                subscription,
                workflowRunId,
            }
        })
    } catch (error) {
        next(error)
    }
}

// get all subscriptions controller
export const getAllSubscriptions = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find();

        if (!subscriptions) {
            return res.status(404).json({
                success: false,
                message: "Subscriptions not found"
            })
        }

        res.status(200).json({
            success: true,
            data: subscriptions,
        })
    } catch (error) {
        next(error)
    }
}


// get subscription of a particular user controller 
export const getSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found"
            })
        }

        res.status(200).json({
            success: true,
            data: subscription,
        })
    } catch (error) {
        next(error);
    }
}

// get user subscriptions controller
export const getUserSubscriptions = async (req, res, next) => {
    try {

        // checking if the user is the same as the one in the token
        if (req.user._id !== req.params.id) {
            const error = new Error('You are not the owner of this account')
            error.statusCode = 401;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.params.id });

        res.status(200).json({
            success: true,
            data: subscriptions
        })

    } catch (error) {
        next(error);
    }
}

// update subscription controller
export const updateSubscription = async (req, res, next) => {
    try {

        const { id } = req.params;

        const updateData = req.body;

        const subscription = await Subscription.findByIdAndUpdate(
            id,
            { $set: updateData },
            {
                new: true, // returns the updated document
                runValidators: true // ensure the update respects schema validation
            }
        );

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            })
        }

        res.status(200).json({
            success: true,
            message: "Subscription updated successfully",
            data: subscription,
        })
    } catch (error) {
        next(error);
    }
}

// delete subscription controller
export const deleteSubscription = async (req, res, next) => {
    try {

        const { id } = req.params;

        const subscription = await Subscription.findByIdAndDelete(id);


        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Subscription deleted successfully'
        })
    } catch (error) {
        next(error);
    }
}

// Cancel Subscription Controller
export const cancelSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID format
        // if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Invalid subscription ID'
        //     });
        // }

        // Find and update subscription with cancelled status
        const subscription = await Subscription.findByIdAndUpdate(
            id,
            {
                $set: {
                    status: 'cancelled',
                    cancelledAt: new Date(),
                    // Optionally clear renewal date
                    renewalDate: null
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: subscription
        });
    } catch (error) {
        next(error);
    }
};