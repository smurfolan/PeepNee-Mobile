import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Button,
    FlatList,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    ToastAndroid
} from "react-native";

import * as firebase from 'firebase';

export class HomeTab extends Component{
  constructor(){
    super()
    this.state = {
        dataSource: [],
        isLoading: true
    }
  }

  renderItem = ({item}) => {
      return (
        <TouchableOpacity style={{ flex: 1, flexDirection: 'row', marginBottom: 3 }}
            onPress = {() => ToastAndroid.show(item.mailboxId, ToastAndroid.SHORT)}>
            <Image style={{ width: 40, height: 40, margin: 5 }}
            source={{ uri: 'https://cdn2.iconfinder.com/data/icons/IconsLandVistaMapMarkersIconsDemo/256/MapMarker_Marker_Outside_Azure.png' }}
            />
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{ fontSize: 16, color: 'green' }}>
                    {item.city}, {item.zipCode}
                </Text>
                <Text style={{ fontSize: 13, marginBottom: 15 }}>
                    {item.address}
                </Text>
            </View>
            <View style={{justifyContent: 'flex-end', justifyContent: 'center', marginRight: 10}}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                    ({item.numberOfMailItems})
                </Text>
            </View>
        </TouchableOpacity>
      )
  }

  renderSeparator = () => {
    return (
        <View
            style={{height: 1, width: '100%', backgroundColor: 'black'}}>
        </View>
    )
  }

  componentDidMount(){
    const url = 'https://us-central1-peepnee-backend.cloudfunctions.net/getMyMailboxes?userId='
                + firebase.auth().currentUser.uid

    fetch(url)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
          dataSource: responseJson,
          isLoading: false
      })
    })
    .catch((error) => {
      console.log(error)
    })
  }

  render(){
    return (
      this.state.isLoading
      ?
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="green" animating />
      </View>
      :
      <View style={styles.container}>
        <FlatList style={{marginTop: 30}}
            data={this.state.dataSource}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => item.mailboxId}
            ItemSeparatorComponent={this.renderSeparator}
        />
      </View>
    )
  }
}

export default HomeTab;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF'
    }
});
