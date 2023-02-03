const db = require('../db/db');
const user = require('./user');
const helper = require('./helpers');

exports.getSessions = function(req, res) {
  const userId = req.query.user_id;
  if (!userId) {
    res.status(400).send('No user id found');
    return;
  }

  db.Session.find(
    { $and: [ { [`detail.${userId}`] : { $exists : true } }, { [`detail.${userId}.is_paid`] : { $eq: false } } ] },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
}

exports.postSessions = function(req, res) {
  //in req.body is the info
  // user addUser controller to add new users
  // returns an insertedIds array which I will use to be the keys
    // for details field
  //

  //var comment = {[user_id]: {comment: 'I wanna go here', date: timestamp}}

// var session = {host: '63d5690765b903d98477c097', detail: {'63d5690765b903d98477c097': {name: 'stacey', tip: 2.42, bill: 12.32, is_paid: false}, '63d57d8704421e1d60c0dbbe': { name: "heather", tip: 1.75, bill: 10.21, is_paid: false}, '63d56921fb74d33c0a908e2b': {name: "Yui", tip: 1.75, bill: 10.21, is_paid: false}}, rest_name : 'Blue Sky', sub_total: 28.21, tip_total: 2.11, receipt: 'www.google.com'}
// // db.User.updateOne({_id: 63d57d8704421e1d60c0dbbe}, { $addToSet: { "friends": ObjectId(63d5690765b903d98477c097)} })
// var session = {host: '63d56a0483bd4d48f67c9981', detail: {'63d56a0483bd4d48f67c9981': {name: 'yuchen', tip: 1.47, bill: 21.41, is_paid: false}, '63d56921fb74d33c0a908e2b': {name: "Yui", tip: 1.75, bill: 10.21, is_paid: false}, '63d5690765b903d98477c097': {name: 'stacey', tip: 2.42, bill: 12.32, is_paid: false}}, rest_name : 'Red Sky', sub_total: 28.21, tip_total: 2.11, receipt: 'www.google.com'}
// //var participants = [{
// //    name: 'Jack Dorsey',
// //    tip: 1.75,
// //    bill: 24.2
// //  },
// //  {
// //   name: "Bugs Bunny",
// //   tip: 1.75,
// //   bill: 10.21,
// //  }
// // ]

// // var info = {
// //   host: userId (this will be in a state variable, set after sign In)
// //   rest_name: 'Chilis',
// //   sub_total: 32.45,
// //   tip: 34.5,
// //   receipt: 'www.google.com'
// // }

// //expecting body to be {users, info} where users is an array of objects and
// // info has the rest_name and other info
// console.log(req.body);

var friends = [ ...req.body.friends];
console.log(friends);
const details = friends.reduce((acc, curr, index) =>
(acc[curr.id] = {
  name: friends[index].name,
  bill: 10,   //friends[index].meal_amount
  tip: 5, //friends[index][tip_amount]?
  is_paid: false
}, acc), {});

console.log(req.body.host.user_id)
details[req.body.host.user_id] = {
  name: req.body.host.name,
  bill: req.body.host.meal_amount,
  tip: req.body.host.tip_amount,
  is_paid: false
}

   db.Session.insertMany({
    host: req.body.host.user_id,
    detail: details,
    rest_name: req.body.restInfo.name,
    sub_total: req.body.sub_total,
    tip_total: req.body.tip_total,
    receipt: req.body.receipt,
    active: true
  })
  .then((sessionId) => {
    console.log('sessionId', sessionId);
    return helper.sendTexts(req.body)
  })
  .then((message) => {
    res.status(200).send(message);
  })
  .catch((err) => {
    res.status(500).send(err);
  })
}

exports.updatePaymentStatus = function(req, res)  {
  const userId = req.body.userId;
  if (!userId) {
    res.status(500).send('User id not found');
  } else {
    db.Session.findOneAndUpdate({[`detail.${userId}`] : { $exists : true }}, {$set:{[`detail.${userId}.is_paid`]: true}})
    .then(data => {
      // after updating the user's status, i want to check if all friends have paid.
      // if so, i want to send notification to the host
      const sessionId = data.id; // unique session id
      return db.Session.findById(sessionId)
    })
    .then(data => {
      for (const friend in data.detail) {
        if (!data.detail[friend].is_paid) {
          res.status(200).send('Successfully updated payment status for the user');
          return;
        }
      }
      // if code comes here, that means all user has paid
      console.log('all user has paid')
    })
    .catch((err) => {
      res.status(500).send('Failed to update payment status for the user');
    })
  }
}