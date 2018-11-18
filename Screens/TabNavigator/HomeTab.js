import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Button
} from "react-native";

export class HomeTab extends Component{
  render(){
    return (
      <View style={styles.container}>
        <Text>This is the HOME tab.</Text>
      </View>
    )
  }
}

export default HomeTab;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
