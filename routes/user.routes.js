import { Router } from "express";
import { getAllUsers, getUser } from "../controllers/user.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";

const userRouter = Router();


userRouter.get('/', getAllUsers);


userRouter.get('/:id', authorize, getUser);

userRouter.post('/', (req, res) => res.send({
    title: 'create user'
}));

userRouter.put('/:id', (req, res) => res.send({
    title: 'update user'
}));

userRouter.delete('/:id', (req, res) => res.send({
    title: 'delete user'
}));


export default userRouter;