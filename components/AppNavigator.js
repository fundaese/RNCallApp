import { createStackNavigator } from 'react-navigation-stack';

import CallPage from './CallPage';
import LoginPage from './LoginPage';

const AppNavigator = createStackNavigator({
  CallPage: { screen: CallPage },
  LoginPage: { screen: LoginPage },

},
{
    initialRouteName: "CallPage"
}

);

export default AppNavigator;