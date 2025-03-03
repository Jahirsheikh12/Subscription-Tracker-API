import User from '../models/user.model.js'

// function to get all the users
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            data: users,
        })
    } catch (error) {
        next(error);
    }
}

// function to get the details of specific user details
export const getUser = async (req, res, next) => {
    try {

        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }


        res.status(200).json({
            success: true,
            data: user,
        })
    } catch (error) {
        next(error);
    }
}