import jwt from "jsonwebtoken";

import { JWT_SECRET } from '../config/env.js';
import User from "../models/user.model.js";


// user makes request to get details -> authorize middleware is called -> if valid -> next() -> getUser controller is called

export const authorize = async (req, res, next) => {
    try {
        let token;

        // checking if token is present in the headers and extracting the token from the headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // if token does not exist or wrong token return a response and stop the execution
        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized access',
            })
        }

        // decoding the jsonwebtoken
        const decode = jwt.verify(token, JWT_SECRET)

        // Find the user by ID from the decoded token
        const user = await User.findById(decode.userId)

        // if user does not exist in the database
        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized access',
            })
        }

        // attaching the user in the request
        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized access',
            error: error.message,
        })
    }
}