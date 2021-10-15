import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  FlatList,
  TouchableHighlight,
  Image,
} from 'react-native';

import { Buffer } from 'buffer';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/Feather';
import PropsNavigationApp, {
  PropsMainRoutes,
} from '../../../@types/RootStackParamApp';

const { width } = Dimensions.get('screen');

const ITEM_WIDTH = width * 0.9;
const ITEM_HEIGHT = ITEM_WIDTH * 0.9;

import { UseAuth } from '../../../contexts/AuthContext';
import { UseDadosTemp } from '../../../contexts/TemporaryDataContext';

import SectionAccount from './components/SectionAccount';

import CreateCategoryGoals from './components/CreateCategoryGoals';
import ManageCategoryGoals from './components/ManageCategoryGoals';

export type PropsHome = {
  navigation: StackNavigationProp<PropsMainRoutes, 'Main'>;
};

const Home = () => {
  const { user, handleLogout } = UseAuth();
  const { navigation } = UseDadosTemp();

  const [stateReload, setStateReload] = useState(false);

  const useForceUpdate = () => {
    const set = useState(0)[1];
    return () => set(s => s + 1);
  };

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (!navigation || !navigation.addListener) return;
    const focus = navigation.addListener('focus', () => {
      setStateReload(false);
      console.log('Foi');
    });

    const blur = navigation.addListener('blur', () => {
      setStateReload(true);
      console.log(stateReload);
    });
  }, [navigation]);

  console.log(
    navigation && navigation.getState
      ? navigation.getState()
      : 'Não carregou o navigation',
  );
  return (
    <ScrollView>
      {stateReload ? (
        <Text>Carregando</Text>
      ) : (
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.containerProfile}>
              <Image
                source={{
                  uri: `data:image/jpg;base64,${Buffer.from(
                      user.avatar == null ? "" : user.avatar,
                    'base64',
                  )}`,
                }}
                style={styles.iconProfile}
              />

              <View style={styles.textBoasVindas}>
                <Text style={{ color: '#fff', fontSize: 20 }}>Boa tarde!</Text>

                <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
                  {user.name}
                </Text>
              </View>
            </View>

            <View style={styles.containerSetting}>
              <Icon2
                name="settings"
                color="#9D3147"
                size={30}
                style={{ marginRight: 20 }}
              />

              <TouchableHighlight onPress={handleLogout}>
                <Icon name="logout" color="#9D3147" size={30} />
              </TouchableHighlight>
            </View>
          </View>
          {/* Scrollable Content */}

          <ScrollView style={styles.scroll}>
            <View style={styles.containerBody}>
              <SectionAccount />

              <CreateCategoryGoals />

              <ManageCategoryGoals />
            </View>
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#EE4266',
    height: 140,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconProfile: {
    width: 70,
    height: 70,
    borderRadius: 50,
    borderColor: 'black',
    borderWidth: 4,
  },
  containerProfile: {
    display: 'flex',
    flexDirection: 'row',
    width: 170,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textBoasVindas: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  containerSetting: {
    width: 80,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  containerBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  scroll: {
    top: -15,
  },
  sectionSaldoGeral: {
    width: width - 60,
    backgroundColor: '#202731',
    height: 80,
    padding: 10,
    borderRadius: 20,
  },

  atalhoCriar: {},

  criarLeft: {},

  criarBtn: {},
});
