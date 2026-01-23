import express from 'express';
import cors from 'cors';
import ms from 'ms';
import { ProductRouter, OrdersRouter, SigninRouter, LoginRouter } from './src/Routes/router.js';

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Monolite API!');
});

app.all('/products', async (req, res) => {
  const routeResponse = await ProductRouter({
    path: req.path,
    method: req.method,
    body: JSON.stringify(req.body)
  });
  res.status(routeResponse.status).send(routeResponse.body);
    });

app.all('/products/:id', async (req, res) => {
  const routeResponse = await ProductRouter({
    path: req.path,
    method: req.method,
    body: JSON.stringify(req.body)
  });
  res.status(routeResponse.status).send(routeResponse.body);
});

app.all('/orders', async (req, res) => {
  const routeResponse = await OrdersRouter({
    path: req.path,
    method: req.method,
    body: JSON.stringify(req.body)
  });
  res.status(routeResponse.status).send(routeResponse.body);
});

app.all('/orders/:id', async (req, res) => {
  const routeResponse = await OrdersRouter({
    path: req.path,
    method: req.method,
    body: JSON.stringify(req.body)
  });
  res.status(routeResponse.status).send(routeResponse.body);
});

app.post('/login', async (req, res) => {
    const routeResponse = await LoginRouter({
        path: req.path,
        method: req.method,
        body: JSON.stringify(req.body)
    });
    res.status(routeResponse.status).send(routeResponse.body);
});

app.post('/signin', async (req, res) => {
    const routeResponse = await SigninRouter({
        path: req.path,
        method: req.method,
        body: JSON.stringify(req.body)
    });
    res.status(routeResponse.status).send(routeResponse.body);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timeUp: ms(process.uptime() * 1000) });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});