import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User name is required'],
        trim: true,
        minLength: [3, 'Name must be at least 3 characters long'],
        maxLength: [50, 'Name must be at most 50 characters long'],
    },

    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email'],
    },

    password: {
        type: String,
        required: [true, 'password is required'],
        minLength: [6, 'Password must be at least 6 characters long'],

    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;