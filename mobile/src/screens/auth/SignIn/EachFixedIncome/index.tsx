import React, { useEffect, useRef, useState } from 'react';

import {
  BackHandler,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { UseAuth } from '../../../../contexts/AuthContext';
import { Lancamento } from '../../../../contexts/EntriesContext';
import { Parcela } from '../../../../contexts/InstallmentContext';

import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, StackActions } from '@react-navigation/native';
import { useTheme } from 'styled-components/native';
import RootStackParamAuth from '../../../../@types/RootStackParamAuth';

// Styles
import {
  Container,
  Content,
  PrefixReaisSymbol,
  Writting,
  SmoothPickerContainer,
  SmoothPickerTopDetail,
  SmoothPickerBottomDetail,
} from './styles';
import { colors, fonts } from '../../../../styles';

// Icon
import IonIcons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

// Components
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';
import SmoothPickerItem from '../../components/SmoothPickerItem';
import CurrencyInput from 'react-native-currency-input';
// @ts-ignore
import Picker from 'react-native-picker-horizontal';
import EntryPlaceholder from '../../components/EntryPlaceholder';
import DatePlaceholder from '../../components/DatePlaceholder';

import { heightPixel, widthPixel } from '../../../../helpers/responsiveness';

export type PropsNavigation = {
  navigation: StackNavigationProp<RootStackParamAuth, 'EachFixedIncome'>;
  route: RouteProp<RootStackParamAuth, 'EachFixedIncome'>;
};

const EachFixedIncome = ({ navigation }: PropsNavigation) => {
  const [incomeAmount, setIncomeAmount] = useState<number | null>(0);
  const [formattedIncomeAmount, setFormattedIncomeAmount] = useState('');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isFocused, setFocused] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const { setupUser, updateSetupUserProps, showNiceToast, hideNiceToast } =
    UseAuth();

  const inputRef = useRef<TextInput>(null);

  const days = Array.from(Array(30).keys());

  useEffect(() => {
    const willShowSubscription = Keyboard.addListener(
      'keyboardWillShow',
      () => {
        setFocused(true);
        // console.log('vai mostrou');
      },
    );
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setFocused(true);
      // console.log('mostrou');
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setFocused(false);
      // console.log('fechou');
    });

    return () => {
      willShowSubscription.remove();
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    // let iterator = setupUser.incomeTagsCount;
    // console.log('---------INCOME---------');
    // console.debug(`Iterator: ${iterator}`);
    // console.debug(`Current: ${setupUser.incomeTags[iterator]}`);
    // console.debug(`Size: ${setupUser.entries.length}`);

    showNiceToast('fake', 'Oops!', null, 500);

    // Caso já tenha passado pela tela, recupera a income aqui
    if (
      setupUser.entries[
        setupUser.incomeTagsCount + setupUser.expenseTags.length
      ] != undefined
    ) {
      if (
        setupUser.entries[
          setupUser.incomeTagsCount + setupUser.expenseTags.length
        ].descricaoLancamento != undefined
      ) {
        var entryIndex = setupUser.entries.findIndex(
          entry =>
            entry.descricaoLancamento ==
            setupUser.incomeTags[setupUser.incomeTagsCount],
        );
        if (entryIndex != -1) {
          var entry = setupUser.entries[entryIndex];
          setIncomeAmount(entry.parcelasLancamento[0].valorParcela);
          setSelectedDay(entry.parcelasLancamento[0].dataParcela.getDate() - 1);
        }
      }
    } else {
      if (setupUser.incomeTagsCount > 0) {
        // Pegar do último
        let previousEntry =
          setupUser.entries[
            setupUser.incomeTagsCount + setupUser.expenseTags.length - 1
          ];
        console.log('else if', previousEntry.parcelasLancamento[0]);
        setSelectedDay(
          previousEntry.parcelasLancamento[0].dataParcela.getDate() - 1,
        );
      } else {
        // Deixa o dia atual como default no smoothpicker
        let currentDate = new Date(Date.now());
        console.log('ultimo else', currentDate.getDate());
        setSelectedDay(currentDate.getDate() - 1);
      }
    }

    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, []);

  useEffect(() => {
    selectedDay != null && setTimeout(() => setLoading(false), 700);
  }, [selectedDay]);

  const backAction = () => {
    if (setupUser.incomeTagsCount == 0) {
      navigation.dispatch(StackActions.replace('FixedIncomes'));
      return true;
    }
    navigation.dispatch(StackActions.replace('EachFixedIncomeCategory'));
    const newSetupProps = setupUser;
    newSetupProps.incomeTagsCount--;
    updateSetupUserProps(newSetupProps);
    return true;
  };

  async function next() {
    const incomeAmount = Number(
      formattedIncomeAmount.replace(/[.]+/g, '').replace(',', '.'),
    );

    if (incomeAmount < 1) {
      showNiceToast(
        'error',
        'Impossível!',
        'Insira um valor maior que R$ 0,99',
      );
      return;
    }

    hideNiceToast();

    let dateNow = new Date(Date.now());
    selectedDay != null && dateNow.setDate(selectedDay + 1);

    const entry = {
      descricaoLancamento: setupUser.incomeTags[setupUser.incomeTagsCount],
      lugarLancamento: 'extrato',
      tipoLancamento: 'receita',
      parcelasLancamento: [
        {
          valorParcela: incomeAmount,
          dataParcela: dateNow,
        } as Parcela,
      ],
      essencial: true,
      categoryLancamento:
        setupUser.entries[
          setupUser.incomeTagsCount + setupUser.expenseTags.length
        ] != undefined
          ? setupUser.entries[
              setupUser.incomeTagsCount + setupUser.expenseTags.length
            ].categoryLancamento
          : undefined,
    } as Lancamento;

    const newSetupProps = setupUser;

    newSetupProps.entries != undefined
      ? (newSetupProps.entries[
          setupUser.incomeTagsCount + setupUser.expenseTags.length
        ] = entry)
      : (newSetupProps.entries = [entry]);

    updateSetupUserProps(newSetupProps);

    navigation.dispatch(StackActions.replace('EachFixedIncomeCategory'));
  }
  const theme: any = useTheme();

  return (
    <Container>
      <Header
        accent={theme.colors.slimyGreen}
        onBackButton={() => backAction()}
        title="Quanto ganha mensalmente com"
        lastWordAccent={`${setupUser.incomeTags[setupUser.incomeTagsCount]}?`}
        subtitle="Insira o valor mais aproximado da média"
        step={`${setupUser.incomeTagsCount + 1} de ${
          setupUser.incomeTags.length
        }`}
      />

      <ScrollView>
        <Content onPress={() => inputRef.current?.focus()} activeOpacity={1}>
          <Writting>
            {!isLoading ? (
              <>
                <PrefixReaisSymbol>R$</PrefixReaisSymbol>
                <CurrencyInput
                  style={{
                    flex: 1,
                    padding: 0,
                    color: theme.colors.davysGrey,
                    fontFamily: fonts.familyType.bold,
                    fontSize: fonts.size.super + 14,
                  }}
                  value={incomeAmount}
                  onChangeValue={txt => setIncomeAmount(txt)}
                  delimiter="."
                  separator=","
                  precision={2}
                  placeholder="0,00"
                  maxValue={999999}
                  placeholderTextColor={'rgba(52, 52, 52, .3)'}
                  selectionColor={theme.colors.davysGrey}
                  onChangeText={formattedValue => {
                    setFormattedIncomeAmount(formattedValue);
                    if (incomeAmount == null) setIncomeAmount(0.0);
                  }}
                  ref={inputRef}
                  onBlur={() => {
                    setFocused(false);
                  }}
                  onFocus={() => {
                    setFocused(true);
                  }}
                />
                {incomeAmount != null && (
                  <IonIcons
                    style={{
                      padding: 6,
                      marginLeft: 16,
                    }}
                    name="close"
                    size={32}
                    color={`rgba(82, 82, 82, .08)`}
                    onPress={() => {
                      setIncomeAmount(0.0);
                    }}
                  />
                )}
              </>
            ) : (
              <EntryPlaceholder />
            )}
          </Writting>
        </Content>
      </ScrollView>

      <SmoothPickerContainer style={{ opacity: isFocused ? 0 : 1 }}>
        <View
          style={{
            height: heightPixel(440) - heightPixel(340),
            justifyContent: 'center',
          }}>
          <Text
            style={{
              textAlign: 'center',
              fontFamily: fonts.familyType.bold,
              fontSize: fonts.size.small,
              color: theme.colors.davysGrey,
            }}>
            Dia de recebimento
          </Text>
        </View>
        <View
          style={{
            height: heightPixel(380),
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            bottom: 0,
          }}>
          {!isLoading ? (
            <Picker
              data={days}
              itemWidth={widthPixel(180)}
              mark={false}
              renderItem={(item: number, index: number) => (
                <View
                  style={{
                    width: widthPixel(180),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <SmoothPickerItem isSelected={item == selectedDay} isIncome>
                    {item + 1}
                  </SmoothPickerItem>
                </View>
              )}
              initialIndex={selectedDay}
              onChange={(day: number) => setSelectedDay(day)}
              interpolateScale={(index: number, itemWidth: number) => ({
                inputRange: [
                  itemWidth * (index - 2),
                  itemWidth * (index - 1),
                  itemWidth * index,
                  itemWidth * (index + 1),
                  itemWidth * (index + 2),
                ],
                outputRange: [0.8, 1, 1.2, 1, 0.8],
              })}
            />
          ) : (
            <DatePlaceholder isIncome />
          )}

          <SmoothPickerTopDetail>
            <AntDesign
              name="caretdown"
              size={widthPixel(40)}
              color={theme.colors.lincolnGreen}
            />
          </SmoothPickerTopDetail>
          <SmoothPickerBottomDetail />
        </View>
      </SmoothPickerContainer>

      <BottomNavigation
        onPress={() => next()}
        description={'Escolher categoria'}
        iconColor={theme.colors.slimyGreen}
        pickerOn={!isFocused}
      />
    </Container>
  );
};

export default EachFixedIncome;
