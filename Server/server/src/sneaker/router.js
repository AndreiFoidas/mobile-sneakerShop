import Router from 'koa-router';
import sneakerStore from './store';
import { broadcast } from "../utils";
import {message} from "koa/lib/response";

export const router = new Router();

router.get('/', async (context) => {
    const response = context.response;
    const userId = context.state.user._id;
    response.body = await sneakerStore.find({ userId });
    response.status = 200; // ok
});

router.get('/:id', async (context) => {
    const userId = context.state.user._id;
    const sneaker = await sneakerStore.findOne({ _id: context.params.id });
    const response = context.response;
    if (sneaker) {
        if (sneaker.userId === userId) {
            response.body = sneaker;
            response.status = 200; // ok
        } else {
            response.status = 403; // forbidden
        }
    } else {
        response.status = 404; // not found
    }
});

const createSneaker = async (context, sneaker, response) => {
    try {
        //console.log(sneaker);
        const userId = context.state.user._id;
        sneaker.userId = userId;
        response.body = await sneakerStore.insert(sneaker);
        response.status = 201; // created
        broadcast(userId, { type: 'created', payload: sneaker });
    } catch (err) {
        response.body = { message: err.message };
        //console.log(err.message)
        response.status = 400; // bad request
    }
};

router.post('/', async context => await createSneaker(context, context.request.body, context.response));

router.put('/:id', async (context) => {
    const sneaker = context.request.body;
    const id = context.params.id;
    const sneakerId = sneaker._id;
    const response = context.response;
    if (sneakerId && sneakerId !== id) {
        response.body = { message: 'Param id and body _id should be the same' };
        response.status = 400; // bad request
        return;
    }
    if (!sneakerId) {
        await createSneaker(context, sneaker, response);
    } else {
        const userId = context.state.user._id;
        sneaker.userId = userId;
        const updatedCount = await sneakerStore.update({ _id: id }, sneaker);
        if (updatedCount === 1) {
            response.body = sneaker;
            response.status = 200; // ok
            broadcast(userId, { type: 'updated', payload: sneaker });
        } else {
            response.body = { message: 'Resource no longer exists' };
            response.status = 405; // method not allowed
        }
    }
});

router.del('/:id', async (context) => {
    const userId = context.state.user._id;
    const sneaker = await sneakerStore.findOne({ _id: context.params.id });
    if (sneaker && userId !== sneaker.userId) {
        context.response.status = 403; // forbidden
    } else {
        await sneakerStore.remove({ _id: context.params.id });
        context.response.status = 204; // no content
    }
});