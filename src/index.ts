import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'
import jwt from 'jsonwebtoken';
import mysql from 'mysql';

const SECRET = 'ThisIsReallySecret';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token: string = req.headers.authorization || '';
  try {
    jwt.verify(token, SECRET);
    next();
  } catch (error) {
    res.status(403).send(error);
  }
};

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PWD,
  database: process.env.MYSQL_DB
});

connection.connect((error) => {
  if (!error) {
    console.log('DB Connected');
  }
})

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', authMiddleware, (__req: Request, res: Response) => {
  connection.query('SELECT * from users', (error, results, __fields) => {
    if (!error) {
      res.send(results);
    }
  });
});

app.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  connection.query(
    'SELECT * FROM users WHERE username=? AND password=?',
    [username, password],
    (error, results, __fields) => {
      if (!error) {
        if (results.length > 0) {
          const token = jwt.sign(
            {
              userId: username,
            },
            SECRET
          );
          res.status(200).send({ results, token });
        } else {
          res.status(403).send('Invalid credentials');
        }
      } else {
        res.status(403).send('Invalid credentials');
      }
    }
  );
});

app.post('/register', (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log(req.body)
  connection.query('INSERT INTO users SET ?', { username, password }, (error, result, fields) => {
    if (!error) {
      res.send('OK');
    } else {
      res.status(400).send('FATAL Error')
    }
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Application listening on port ${process.env.PORT}`);
});
