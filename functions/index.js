const functions = require('firebase-functions');
var fetch = require('node-fetch')

// Import Admin SDK
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase);

// Get a database reference
var db = admin.database();

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
