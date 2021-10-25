const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyparser = require('koa-bodyparser');

app.use(bodyparser());
app.use(cors());
app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
});

app.use(async (ctx, next) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await next();
});

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.response.body = { issue: [{ error: err.message || 'Unexpected error' }] };
        ctx.response.status = 500;
    }
});

class Sneaker {
    constructor({ id, name, price, owned, releaseDate, date, version }) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.owned = owned;
        this.releaseDate = releaseDate;
        this.date = date;
        this.version = version;
    }
}

const sneakers = [];
for (let i = 0; i < 3; i++) {
    sneakers.push(new Sneaker({ id: `${i}`, name: `sneaker ${i}`, price: i, owned: true, releaseDate: new Date(Date.now() + i), date: new Date(Date.now() + i), version: 1  }));
}
let lastUpdated = sneakers[sneakers.length - 1].date;
let lastId = sneakers[sneakers.length - 1].id;
const pageSize = 10;

const broadcast = data =>
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

const router = new Router();

router.get('/sneaker', ctx => {
    const ifModifiedSince = ctx.request.get('If-Modif ied-Since');
    if (ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastUpdated.getTime() - lastUpdated.getMilliseconds()) {
        ctx.response.status = 304; // NOT MODIFIED
        return;
    }
    const name = ctx.request.query.text;
    const page = parseInt(ctx.request.query.page) || 1;
    ctx.response.set('Last-Modified', lastUpdated.toUTCString());
    const sortedItems = sneakers
        .filter(s => name ? s.name.indexOf(name) !== -1 : true)
        .sort((n1, n2) => -(n1.price - n2.price));
    const offset = (page - 1) * pageSize;
    // ctx.response.body = {
    //   page,
    //   items: sortedItems.slice(offset, offset + pageSize),
    //   more: offset + pageSize < sortedItems.length
    // };
    ctx.response.body = sneakers;
    ctx.response.status = 200;
});

router.get('/sneaker/:id', async (ctx) => {
    const sneakerId = ctx.request.params.id;
    const sneaker = sneakers.find(sneaker => sneakerId === sneaker.id);
    if (sneaker) {
        ctx.response.body = sneaker;
        ctx.response.status = 200; // ok
    } else {
        ctx.response.body = { issue: [{ warning: `item with id ${sneakerId} not found` }] };
        ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
    }
});

const createItem = async (ctx) => {
    const sneaker = ctx.request.body;
    if (!sneaker.name) { // validation
        ctx.response.body = { issue: [{ error: 'Name is missing' }] };
        ctx.response.status = 400; //  BAD REQUEST
        return;
    }
    sneaker.id = `${parseInt(lastId) + 1}`;
    lastId = sneaker.id;
    sneaker.price = 0;
    sneaker.owned = true;
    sneaker.releaseDate = new Date();
    sneaker.date = new Date();
    sneaker.version = 1;
    sneakers.push(sneaker);
    ctx.response.body = sneaker;
    ctx.response.status = 201; // CREATED
    broadcast({ event: 'created', payload: { sneaker } });
};

router.post('/sneaker', async (ctx) => {
    await createItem(ctx);
});

router.put('/sneaker/:id', async (ctx) => {
    const id = ctx.params.id;
    const sneaker = ctx.request.body;
    const sneakerId = sneaker.id;
    if (sneakerId && id !== sneaker.id) {
        ctx.response.body = { issue: [{ error: `Param id and body id should be the same` }] };
        ctx.response.status = 400; // BAD REQUEST
        return;
    }
    if (!sneakerId) {
        await createItem(ctx);
        return;
    }
    const index = sneakers.findIndex(sneaker => sneaker.id === id);
    if (index === -1) {
        ctx.response.body = { issue: [{ error: `sneaker with id ${id} not found` }] };
        ctx.response.status = 400; // BAD REQUEST
        return;
    }
    //const sneakerPrice = parseInt(ctx.request.get('ETag')) || sneaker.price;
    //if (itemVersion < items[index].version) {
    //    ctx.response.body = { issue: [{ error: `Version conflict` }] };
    //    ctx.response.status = 409; // CONFLICT
    //    return;
    //}
    //item.version++;
    sneakers[index] = sneaker;
    lastUpdated = new Date();
    ctx.response.body = sneaker;
    ctx.response.status = 200; // OK
    broadcast({ event: 'updated', payload: { sneaker } });
});

router.del('/sneaker/:id', ctx => {
    const id = ctx.params.id;
    const index = sneakers.findIndex(sneaker => id === sneaker.id);
    if (index !== -1) {
        const sneaker = sneakers[index];
        sneakers.splice(index, 1);
        lastUpdated = new Date();
        broadcast({ event: 'deleted', payload: { sneaker } });
    }
    ctx.response.status = 204; // no content
});

setInterval(() => {
    lastUpdated = new Date();
    lastId = `${parseInt(lastId) + 1}`;
    const sneaker = new Sneaker({ id: lastId, name: `sneaker ${lastId}`, price: 0, owned: true, releaseDate: lastUpdated, date: lastUpdated, version: 1 });
    sneakers.push(sneaker);
    console.log(`
   ${sneaker.name}`);
    broadcast({ event: 'created', payload: { sneaker } });
}, 150000);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000);
