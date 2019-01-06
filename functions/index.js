const functions = require('firebase-functions');
var fetch = require('node-fetch')

// Import Admin SDK
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase);

// Get a database reference
var db = admin.database();

exports.getMyMailboxes = functions.https.onRequest((req, res) => {
    var userId = req.query.userId
    var mailboxesOwnedByThisUser = []
    var userMailboxesResult = []

    return db.ref('/MailboxOwnership')
    .orderByChild('userId')
    .equalTo(userId)
    .once("value").then(snapshot => {
      snapshot.forEach(childSnapshot => {
        if(mailboxesOwnedByThisUser.indexOf(childSnapshot.val().mailboxId) < 0){
          mailboxesOwnedByThisUser.push(childSnapshot.val().mailboxId)
        }
      })

      return Promise.all(mailboxesOwnedByThisUser)
    }).then(mailboxesOwnedByThisUser => {
      return db.ref('/Mailboxes')
      .once('value').then(snapshot => {
        snapshot.forEach(childSnapshot => {
          if(mailboxesOwnedByThisUser.indexOf(parseInt(childSnapshot.key)) > -1){
            userMailboxesResult.push({
              "mailboxId": childSnapshot.key,
              "address": childSnapshot.val().address,
              "city": childSnapshot.val().city,
              "zipCode": childSnapshot.val().zipCode,
              "numberOfMailItems": childSnapshot.val().numberOfMailItems
            })
          }
        })

        return res.send(JSON.stringify(userMailboxesResult))
      })
    })
});

exports.getMailboxItems = functions.https.onRequest((req, res) => {
  var mailboxId = req.query.mailboxId
  var mailboxItems = []

  return db.ref('/MailItems')
    .orderByChild('mailboxId')
    .equalTo(parseInt(mailboxId))
    .once("value").then(snapshot => {
      snapshot.forEach(childSnapshot => {
        mailboxItems.push({
          "mailItemId": childSnapshot.key,
          "ocrText": childSnapshot.val().ocrText,
          "snapshotUrl": childSnapshot.val().snapshotUrl,
          "status": childSnapshot.val().status
        })
      })

      return res.send(JSON.stringify(mailboxItems))
    })
});

exports.sendPushNotification = functions.database.ref('MailItems/{id}').onCreate((change, context) => {
    var usersToBeNotified = []
    var deviceExpoTokens = []
    //return the main promise
    return db.ref('/MailboxOwnership')
    .orderByChild('mailboxId')
    .equalTo(change.val().mailboxId)
    .once("value").then(snapshot => {
      snapshot.forEach(childSnapshot => {
        if(usersToBeNotified.indexOf(childSnapshot.val().userId) < 0){
          usersToBeNotified.push(childSnapshot.val().userId)
        }
      })

      return Promise.all(usersToBeNotified)
    }).then(usersToBeNotified => {
      return db.ref('/DeviceLogins')
      .once('value').then(snapshot =>{
        snapshot.forEach(childSnapshot => {
          if(childSnapshot.val().isLoggedIn && usersToBeNotified.indexOf(childSnapshot.val().userId) > - 1){
            if(deviceExpoTokens.indexOf(childSnapshot.val().deviceExpoToken) < 0){
              deviceExpoTokens.push(
                {
                    "to": childSnapshot.val().deviceExpoToken,
                    "body": "You have a new mail in your box."
                }
              )
            }
          }
        })

        return Promise.all(deviceExpoTokens);
      })
    }).then(deviceExpoTokens => {
      if(deviceExpoTokens.length > 0){
        fetch('https://exp.host/--/api/v2/push/send', {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(deviceExpoTokens)
        })
      }

      return deviceExpoTokens
    })
})
