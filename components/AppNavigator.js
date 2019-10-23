import { createStackNavigator } from 'react-navigation-stack';

import ChatPage from './ChatPage';
import LoginPage from './LoginPage';

const AppNavigator = createStackNavigator({
  ChatPage: { screen: ChatPage },
  LoginPage: { screen: LoginPage },

},
{
    initialRouteName: "LoginPage"
}

);

export default AppNavigator;