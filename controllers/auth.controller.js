import mongoose from "mongoose"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

export const signUp = async (req, res, next) => {
    /*
        this not the user session rather its the mongoose session we need this because to perform atomic updates or atomic operations.
    */
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const { name, email, password } = req.body;

        // if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 400;
            throw error
        }

        // hash the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt)

        // create new user
        const newUsers = await User.create([{ name, email, password: hashPassword }], { session });

        // generating token for new user
        const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: newUsers[0],
            }
        })

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const signIn = async (req, res, next) => {

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        // If user does not exist
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // password validation
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // if password is invalid
        if (!isPasswordValid) {
            const error = new Error('Invalid password');
            error.statusCode = 401;
            throw error;
        }

        // generating token for the user
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: {
                token,
                user,
            }
        })

    } catch (error) {
        // sending the error to the error middleware
        next(error);
    }
}

export const signOut = async (req, res, next) => {

}