import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import config from 'config';
import logger from './logging/logger';
import https from 'https';
import { certificateFor } from 'devcert';

const app: Application = express();

app.use(morgan('combined', {
  stream: { write: msg => logger.info(msg) }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
    return res.status(200).json({});
  }
  next();
});

app.get('/api', (req: Request, res: Response) => {
  return res.status(200).send({
      message: `Hello ${config.get<string>('Key')}`,
  });
});

app.use(express.static('public'));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.name, err);
  if (err && err.name && err.name === 'UnauthorizedError') {
    return res.status(401).send({ error: err });
  } else {
    return next(err);
  }
});

try {
  if (process.env.NODE_ENV === 'development') {
    const port = config.get<number>('Port');
    certificateFor('localhost').then(ssl => {
      https.createServer(ssl, app).listen(port, () => {
        logger.info(`Connected successfully on port ${port}`);
      });
    });
  } else {
    const port = process.env.PORT || config.get<number>('Port');
    app.set('trust proxy', 1);
    app.listen(port, () => {
      logger.info(`Connected successfully on port ${port}`);
    });
  }
} catch (error) {
  logger.error((error as Error).name, error);
}