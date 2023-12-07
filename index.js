import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import CodePush from 'react-native-code-push';
import NetInfo from '@react-native-community/netinfo';
import SplashScreen from 'react-native-splash-screen';
import Spinner from 'react-native-spinkit';

class RNSnakeIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      receivedBytes: 0,
      totalBytes: 0,
      isCalledUpdateMethod: false,
    };
  }

  _handleUpdate = async () => {
    const updateMessage = (await CodePush.checkForUpdate()) || {};
    console.log(updateMessage);
    await CodePush.sync(
      {
        installMode: CodePush.InstallMode.IMMEDIATE,
        mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
        rollbackRetryOptions: {
          maxRetryAttempts: 3,
        },
      },
      status => {
        switch (status) {
          case 7:
            this.setState({visible: true});
            break;
          case 8:
            this.setState({visible: false});
            break;
        }
      },
      ({receivedBytes, totalBytes}) => {
        this.setState({
          receivedBytes: (receivedBytes / 1024).toFixed(2),
          totalBytes: (totalBytes / 1024).toFixed(2),
        });
      },
    );
  };

  componentDidMount() {
    SplashScreen.hide();

    this.unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        if (!this.state.isCalledUpdateMethod) {
          this.setState({isCalledUpdateMethod: true});
          this._handleUpdate();
        }
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <View style={styles.magicContainer}>
        {!this.state.visible ? (
          <TouchableOpacity
            style={styles.updateCircle}
            onPress={() => {
              if (this.state.receivedBytes < 100) {
                this._handleUpdate();
              }
            }}>
            <Text style={styles.updateText}>点击此处更新</Text>
          </TouchableOpacity>
        ) : (
          <Spinner isVisible={true} color={'green'} size={60} type={'Circle'} />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  updateCircle: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  updateText: {
    fontSize: 18,
    color: 'green',
  },

  magicContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default RNSnakeIndex;