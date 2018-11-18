import React, { Component } from 'react';
import { StyleSheet, Text, View } from "react-native";

import { createBottomTabNavigator } from "react-navigation"
import Icon from 'react-native-vector-icons/Ionicons'

import HomeTab from './HomeTab'
import SettingsTab from './SettingsTab'

export default createBottomTabNavigator({
  Home:{
    screen: HomeTab,
    navigationOptions: {
        tabBarLabel: 'Home',
        tabBarIcon:({tintColor})=>(
          <Icon name="ios-home" color={tintColor} size={24}/>
        )
    }
  },
  Settings:{
    screen: SettingsTab,
    navigationOptions: {
        tabBarLabel: 'Settings',
        tabBarIcon:({tintColor})=>(
          <Icon name="ios-settings" color={tintColor} size={24}/>
        )
    }
  }
},
{
  //router config
  initialRoutName: 'Home',
  order: ['Home', 'Settings'],
  //navigation for complete tab navigator
  navigationOptions:{
    tabBarVisible:true
  },
  tabBarOptions:{
    activeTintColor:'red',
    inactiveTintColor:'grey'
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
