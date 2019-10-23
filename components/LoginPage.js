import React, { Component } from 'react';

import {
	AppRegistry,
	StyleSheet,
	Text,
	View,
	TextInput,
} from 'react-native';

import * as firebase from 'react-native-firebase';
import {Input} from './Input';
import {Button} from './Button';

export default class LoginPage extends Component {
    
    constructor(props){
        super(props);
        this.unsubscriber = null;
        this.state = {
          email: '',
          password: '',
          isAuthenticated: false,
          user: null
        }

        this.navigator = this.props.navigator;
      }

 
    componentDidMount(){
        this.unsubscriber = firebase.auth().onAuthStateChanged((changedUser) => {
            this.setState({ user:changedUser });
            
        })

        if(this.unsubscriber){
          this.unsubscriber();
      }
    } 
    
    onLogin = () => {
        firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
        .then((loggedInUser) => {
            console.log('Login user:', this.state.email);
            this.props.navigation.navigate("ChatPage");
        }).catch((error) => {
            console.log("Login fail with error",error);
        })
    }

    render(){

        return(
            <View style = {styles.form}>
            <Input 
                placeholder= "Enter your email..."
                label = "Email" 
                onChangeText={email => this.setState({email})}
                value= {this.state.email}
                keyboardType = 'email-address'/>

            <Input 
                placeholder= "Enter your password..."
                label = "Password" 
                secureTextEntry 
                onChangeText={password => this.setState({password})}
                value= {this.state.password}/>

            <Button onPress =
             {this.onLogin.bind(this)}>
                Log In</Button>
               

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex:1, 
      backgroundColor: "#F5FCFF", 
      padding: 20, alignItems:'center', 
      justifyContent: 'center', 
     
    },
  
    form: {
      flex:1,
      justifyContent: 'center', 
    }
  });
  