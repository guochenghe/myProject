var express = require("express");

var app = express();

var MongoClient = require('mongodb').MongoClient;

var assert = require('assert');

var URL = 'mongodb://localhost:27017/userinfo';

function db(URL, callback) {

  MongoClient.connect(URL, function (err, db) {

    if (err) {
      console.log('数据库连接失败');
      return;
    }
    console.log('数据库连接成功');
    callback(err, db);

  });
}


app.get('/add', function (req, res) {

  db(URL, function (err, db) {
    if (err) {
      callback(err, null);
    }
    db.collection('userinfo').insertOne({'name': '马六'}, function (err, result) {
      if (err) {
        console.log('数据库写入失败');
        return;
      }
      console.log('数据库写入成功');
      res.end();
      db.close;
    });
  })

});

app.get('/del', function (req, res) {

  db(URL, function (err, db) {
    if (err) {
      callback(err, null);
    }
    db.collection('userinfo').remove({'name': '马六'}, function (err, result) {
      if (err) {
        console.log('删除失败');
        return;
      }
      console.log('删除成功');
      res.end();
      db.close;
    });
  })

});

app.get('/update', function (req, res) {

  db(URL, function (err, db) {
    if (err) {
      callback(err, null);
    }
    db.collection('userinfo').update({'name': '王五'}, {$set: {'name': ' 赵四'}}, function (err, result) {
      if (err) {
        console.log('数据库更新失败');
        return;
      }
      console.log('数据库更新成功');
      res.end();
      db.close;
    });
  });
});

app.get('/find', function (req, res) {

  db(URL, function (err, db) {
    if (err) {
      callback(err, null);
    }
    var result = [];

    var cursor = db.collection('userinfo').find();

    cursor.each(function (err, item) {
      if (err) {
        console.log("游标遍历错误");
        return;
      }
      if (item != null) {
        result.push(item);
      } else {
        //console.log(result);
        //遍历完毕
        db.close();
        console.log(result);
      }
    })
  });
});


app.listen('9988');

