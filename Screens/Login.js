import React, { Component } from 'react';
import { StyleSheet, Text, View, AsyncStorage } from "react-native";
import { Container, Content, Form, Input, Item, Button, Label } from 'native-base'

import * as firebase from 'firebase';

import { Permissions, Notifications } from 'expo';

export default class Login extends React.Component {
  constructor(props){
    super(props)

    this.state = ({
      email: '',
      password: ''
    })
  }

  // Show the user a pop-up to allow for push notifications. If user allows inspect
  // store the expo token in the DB.
  registerForPushNotificationsAsync = async (userInfo) => {
    const { existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }

    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();
    // Check if there's already a record with such uid and expoToken in DeviceLogins
    let deviceLoginAlreadyExists = false;

    firebase.database().ref('/DeviceLogins')
    .orderByChild('userId')
    .equalTo(userInfo.user.uid)
    .once("value").then(snapshot => {
      // Because user with the same email/password can login from different devices
      snapshot.forEach(function(childSnapshot){
        var availableExpoToken = childSnapshot.val().deviceExpoToken;

        if(availableExpoToken == token){
          deviceLoginAlreadyExists = true
        }
      })
      if(!deviceLoginAlreadyExists){
        firebase.database().ref('DeviceLogins').push({
          userId: userInfo.user.uid,
          deviceExpoToken: token,
          isLoggedIn: true
        })
      }
      else{
        // Just mark the user as logged in
        firebase.database().ref('DeviceLogins')
        .orderByChild('deviceExpoToken')
        .equalTo(token)
        .once('value', function (snapshot) {
          snapshot.forEach(function(child) {
            if(child.val().userId == userInfo.user.uid){
              child.ref.update({isLoggedIn: true});
            }
          })
        })
      }
    });
  }

  signUpUser = (email, password) => {
    try{
      if(this.state.password.length < 6){
        alert("Please enter at least 6 characters")
        return;
      }

      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(authResponse){
          firebase.database().ref('Users').child(authResponse.user.uid).set({
            email: authResponse.user.email,
            createdAt: authResponse.user.metadata.creationTime
          }).then((data)=>{
            //success callback
          }).catch((error)=>{
            //error callback
          })
        }).catch(function(error) {
          //Handle error
        });
    }
    catch(error){
      console.log(error.toString())
    }
  }

  loginUser = (email, password) => {
    try{
      firebase.auth().signInWithEmailAndPassword(email, password).then(user => {
        this.registerForPushNotificationsAsync(user);
      })
    }
    catch(error){
      console.log(error.toString())
    }
  }

  render() {
    return (
      <Container style={styles.container}>
        <Form>
          <Item floatingLabel>
            <Label>Email</Label>
            <Input
              autoCorrect={false}
              autoCapitalize="none"
              onChangeText={(email)=>this.setState({email})}
            />
          </Item>
          <Item floatingLabel>
            <Label>Password</Label>
            <Input
              secureTextEntry={true}
              autoCorrect={false}
              autoCapitalize="none"
              onChangeText={(password)=>this.setState({password})}
            />
          </Item>
          <Button style={{marginTop: 10}}
            full
            rounded
            success
            onPress={()=>this.loginUser(this.state.email, this.state.password)}
          >
            <Text style={styles.inputButtonsText}>Login</Text>
          </Button>
          <Button style={{marginTop: 10}}
            full
            rounded
            primary
            onPress={()=>this.signUpUser(this.state.email, this.state.password)}
          >
            <Text style={styles.inputButtonsText}>Sign up</Text>
          </Button>
        </Form>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding:10
  },
  inputButtonsText:{
    color:'white'
  }
});
