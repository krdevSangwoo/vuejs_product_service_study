const express = require('express');
const app = express();
const session = require('express-session');
const fs = require('fs'); // 디렉토리 접근 모듈

app.use(session({
  secret: 'secret code', // 세션에 대한 키
  resave: false, // 리퀘스트 요청에 대해 세션 수정사항이 없더라도 다시 저장하는지 여부
  saveUninitialized: false, // 세션에 저장할 내역이 없더라도 세션을 재저장하는지
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 // 쿠키 유효시간 1시간
  }
}));

app.use(express.json({
  limit: '50mb'
}));

const server = app.listen(3000, () => {
  console.log('Server Started. port 3000.');
});

let sql = require('./sql.js');
// sql.js의 쿼리문 수정 시 캐시 삭제 후 재반영
fs.watchFile(__dirname + '/sql.js', (curr, prev) => {
  console.log('sql 변경 시 재시작 없이 반영되도록 함');
  delete require.cache[require.resolve('./sql.js')];
  sql = require('./sql.js');
});

const db = {
  database: 'dev',
  connectionLimit: 10,
  host: 'localhost',
  port: 8000,
  user: 'root',
  password: 'mariadb'
};

const dbPool = require('mysql').createPool(db);

app.get('/', (req, res) => {
  const a = 1;
  res.send('<h1>normal page</h1>');
});

app.post('/api/login', async(request, res) => {
  // request.session['email'] = 'seungwon.go@gmail.com';
  // res.send('ok');
  try {
    await req.db('signUp', request.body.param);
    if(request.body.param.length > 0) {
      for(let key in request.body.param[0]){
        request.session[key] = request.body.param[0][key];
      }
      res.send(request.body.param[0]);
    } else{
      res.send({error: "Please try again or contact system manager"})
    }
  }catch(err){
    res.send({
      error: "DB access error"
    });
  }
});

app.post('/api/logout', async(request, res) => {
  request.session.destroy();
  res.send('ok');
});

// api/login,logout외의 주소로 접속시 해당 코드 실행
app.post('/api/:alias', async(request, res) => {
  try{
    res.send(await req.db(request.params.alias, request.body.param))
  } catch(err){
    res.status(500).send({
      error: err
    });
  }
});

app.post('/apirole/:alias', async(request, res) => {
  if(!request.session.email){
    return res.status(401).send({error: 'You need to login.'});
  }
  try{
    res.send(await req.db(request.params.alias, request.body.param))
  } catch(err){
    res.status(500).send({
      error: err
    });
  }
});

const req = {
  async db(alias, param = [], where = '') {
    return new Promise((resolve, reject) => dbPool.query(sql[alias].query + where, param, (error, rows) => {
      if(error) {
        if(error.code != 'ER_DUP_ENTRY')
          console.log(error);
        resolve({
          error
        });
      } else resolve(rows);
    }));
  }
}