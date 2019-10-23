import React, {Component} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Button,
  TextInput
} from 'react-native';

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices
} from 'react-native-webrtc';

import io from "socket.io-client";
import * as firebase from 'react-native-firebase';


const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
const pc = new RTCPeerConnection(configuration);

export default class ChatPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sdpDescription: {},
      sdpArr: [],
      currentUser: null,
    };

    this.navigator = this.props.navigator;
  }

  handleSubmit = (event) => {
    pc.createOffer()
    .then(desc => {
      pc.setLocalDescription(desc, function (offer) {});

      this.setState({ sdpDescription: desc });

      console.log("desc.type:", desc.type);
    }) 
  }

  handleAnswer = () => {
    const { sdpDescription } = this.state;

    if(sdpDescription.type === 'offer'){
      pc.createAnswer().then(function(answer) {
        return pc.setLocalDescription(answer);
      })
      .then(function() {
        // Send the answer to the remote peer through the signaling server.
        pc.setRemoteDescription(new RTCSessionDescription(answer))
      })
      .catch(handleGetUserMediaError); 
    }
}

  componentDidMount() {
    this.socket = io("http://10.254.19.234:3000");
    this.socket.on("sdp", msg => {          //socket.on is responsible for listening for incoming messages.
      this.setState({ sdpArr: [...this.state.sdpArr, msg] });
      console.log("sdp message: ", msg);
    });

    const { currentUser } = firebase.auth()
    this.setState({ currentUser })

  }

  sendSdp(){
    const { sdpDescription } = this.state;

    this.socket.emit("sdp", sdpDescription.sdp); //socket.emit is responsible for sending messages.
    this.setState({ sdpDescription: "" });
  }

  render() {
    const sdpArr = this.state.sdpArr.map(sdp => (
      <Text key={sdp}>{sdp}</Text>
    ));

    const { currentUser } = this.state
    

    return (
      <ScrollView style={styles.container}>
        
        <Button title="Create Offer" 
          style = {styles.button}
          onPress= 
         {this.handleSubmit.bind(this)} 
         > Send SDP </Button>
        
        <Button title="Start Call" 
          style = {styles.button}
          onPress= 
         {this.sendSdp.bind(this)} 
         > Send SDP </Button>

        <Button title="Create Answer" 
          style = {styles.button}
          onPress= 
         {this.handleAnswer.bind(this)} 
         > ANSWER </Button>
        
        <Text>
        {currentUser && currentUser.email}
        </Text>
        {sdpArr} 

      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF"
  },

  button: {
    backgroundColor: 'blue',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 50,
    color: 'white',
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    overflow: 'hidden',
    padding: 12,
    textAlign:'center',
  }
});

