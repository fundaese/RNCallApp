import React, {Component} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Button,
  TextInput,
  
} from 'react-native';

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  getUserMedia
} from 'react-native-webrtc';

import io from "socket.io-client";
import * as firebase from 'react-native-firebase';


let socket=null;
let isCaller=false;
let isCallee=false;
let localStream = null;


const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
const pc = new RTCPeerConnection(configuration);

export default class CallPage extends React.Component {

constructor(props) {
    super(props);
    this.state = {
      sdp: "",
      sdpObject: {},
      sdpArr: [],
      localStream: null,
      videoURL: null,
      remoteStream: null,
      isFront: true
    };

    this.navigator = this.props.navigator;
  }

handleSubmit = () => {
  isCaller = true;
  mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
     .then(stream => {
      localStream = stream;
      localStream.getTracks().forEach(() => pc.addStream(localStream));
      //that.setState({localStream: stream.toURL()});
      //localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      console.log("negotiation gelmeden");
      pc.onnegotiationneeded = () => {
        console.log("burada ne oldu");
        pc.createOffer({iceRestart: true}).then(desc => {
          pc.setLocalDescription(desc).then(function (res) {
          socket.emit("sdp", desc.sdp); //socket.emit is responsible for sending messages.
          console.log("offer gönderildi mi?");
        });
        });
      };
    }).catch(error => {"mediaStream error"});
    console.log('Requesting local stream');
}

// handleEndCall = function(stream){
//    console.log('Ending call');
//    pc.getTransceivers().forEach((transceiver) => {
//     transceiver.stop();
//   });
// }

componentDidMount() {
  socket = io("http://10.254.19.143:3000");

  socket.on('error', (error) => {
      console.log("error: ", JSON.stringify(error));
      // ...
  });

  socket.on("sdp", sdp => {   //socket.on is responsible for listening for incoming messages.
   if(!isCaller) {
      console.log("offerSdp: ", sdp);
      
      pc.setRemoteDescription({
        sdp: sdp,
        type:"offer"
      }).then(() => {
           console.log('success...', pc);
           mediaDevices.getUserMedia({
            audio: true,
            video: true
          }).then(stream => {
            localStream = stream;
            localStream.getTracks().forEach(() => pc.addStream(localStream));
            that.setState({localStream: stream.toURL()});
          });
           pc.createAnswer().then((desc) => {
             pc.setLocalDescription(desc).then(() => {
              isCallee = true;
              socket.emit("answerSdp", desc.sdp); 
              
               }).catch((err) => {
                 console.log("answersdp can not send to remote",JSON.stringify(err));
               });
           }).catch((err) => {
             console.log("cannot create answer");
           });
       })
         .catch(e => console.error(e));
    }
  });
  
 socket.on("answerSdp", answerSdp => { //socket.on is responsible for listening for incoming messages.
     if(!isCallee){
      console.log("answerSDP: ", answerSdp);
      
      pc.setRemoteDescription({
         sdp: answerSdp,
         type:"answer"
       }).then((result) => {
         console.log("result -> ", result);
       }).catch((err) => {
         console.log("failed to set remote sdp",JSON.stringify(err))
       });
     }
       
      
  });

  pc.onicecandidate = function (event) {
    if(!event.candidate) return;
    if(isCaller){
      socket.emit('candidateFromCaller',event.candidate);
      console.log('candidate from caller', event.candidate);
    } else {
      socket.emit('candidateFromCallee',event.candidate);
      console.log('candidate from callee', event.candidate);
    }
    
  };

  socket.on("candidateFromCaller", icecandidate => {
    pc.addIceCandidate(new RTCIceCandidate(icecandidate));
  })

  socket.on("candidateFromCallee", icecandidate => {
    pc.addIceCandidate(new RTCIceCandidate(icecandidate));
  })
 
  pc.oniceconnectionstatechange = (event) => {
    console.log('oniceconnectionstatechange',event.target.iceConnectionState)
  }

  const that = this;

  pc.onaddstream = function (event) {
    console.log('onaddstream---------------', event.stream);
    if(event) {
      that.setState({remoteStream: event.stream.toURL()});
    }
   
  }
  
 
}

render() {

  const sdpArr = this.state.sdpArr.map(sdp => (
      <Text key={sdp}>{sdp}</Text>
  ));

  return (
      <ScrollView style={styles.container}>
        
       <Button title="Start Call" 
          style = {styles.button}
          onPress= {this.handleSubmit.bind(this)} >
        </Button>
     
       
        {/* <Button title="End Call" 
          style = {styles.button}
          onPress= {this.handleEndCall.bind(this)} >
        </Button>  */}
        
        
         { <RTCView streamURL={this.state.remoteStream} style={{ width: 500, height: 200 }}/>}

         { <RTCView streamURL={this.state.localStream} style={{ width: 500, height: 200}}/>}

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
  },
});

