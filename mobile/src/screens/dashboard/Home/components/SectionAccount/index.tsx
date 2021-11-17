import { RouteProp } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'


import Button from '../../../../../components/Button'

import {UseDadosTemp} from '../../../../../contexts/TemporaryDataContext'

import retornarIdDoUsuario from '../../../../../helpers/retornarIdDoUsuario'
import Icon from '../../../../../helpers/gerarIconePelaString'

import { UseContas, Conta } from '../../../../../contexts/AccountContext'

import {
    Container,
    LabelDescriptionBalance,
    LabelBalance,
    Separator,
    LabelDescriptionAccount,
    SectionBalance,
    ContainerAccount,

    ContainerCardAccount,
    SectionDescription,
    SectionName,
    LabelName,
    LabelCategory,
    SectionBalanceAccount,
    LabelBalanceAccount,
    SectionIcon
} from './styles'
import { StackActions } from '@react-navigation/native'


type CardAccount = {
    item: Conta
}

const CardAccount = ({item}: CardAccount) => {

    console.log('item', typeof item.categoryConta != 'string' && item.categoryConta.iconeCategoryConta != "" )

    const {contas, handleReadByUserContas} = UseContas()
    const [saldoConta, setSaldoConta] = useState('0');
    useEffect(() => {
        let aux = 0

        contas && contas.map(item => {
            aux += item.saldoConta
            setSaldoConta((item.saldoConta).toLocaleString('pt-br',{ style: 'currency', currency: 'BRL'}))
        })

        setSaldoConta(aux.toLocaleString('pt-br',{ style: 'currency', currency: 'BRL'}))
        
    }, [contas])

    return(
        <ContainerCardAccount>
            <SectionDescription>
                <SectionIcon>
                    <Icon size={25} color='gray' stringIcon={typeof item.categoryConta != 'string' && item.categoryConta.iconeCategoryConta != "" ?  item.categoryConta.iconeCategoryConta : 'Ionicons:wallet'}/>
                </SectionIcon>
                <SectionName>
                    <LabelName>{item.descricao}</LabelName>
                    <LabelCategory>Conta Corrente</LabelCategory>
                </SectionName>
            </SectionDescription>
            <SectionBalanceAccount>
                <LabelBalanceAccount>{saldoConta}</LabelBalanceAccount>                    
            </SectionBalanceAccount>            
        </ContainerCardAccount>
    )
}



const SectionAccount = () => {
    const {contas, handleReadByUserContas} = UseContas()
    const [saldo, setSaldo] = useState('0')
    const [saldoConta, setSaldoConta] = useState('0');
    const { navigation }  = UseDadosTemp()

    useEffect(() => {
        let aux = 0

        contas && contas.map(item => {
            aux += item.saldoConta
            setSaldoConta((item.saldoConta).toLocaleString('pt-br',{ style: 'currency', currency: 'BRL'}))
        })

        setSaldo(aux.toLocaleString('pt-br',{ style: 'currency', currency: 'BRL'}))
        
    }, [contas])

    useEffect(() => {
        (async function(){
            handleReadByUserContas(await retornarIdDoUsuario())
        })()    
    }, [])
    return (
        <Container>
            <SectionBalance>
                <LabelDescriptionBalance>Saúde financeira</LabelDescriptionBalance>
                <LabelBalance>{saldo}</LabelBalance>
            </SectionBalance>

            <Separator />

            <ContainerAccount>
                <LabelDescriptionAccount>Minhas contas</LabelDescriptionAccount>

                {
                    
                    contas && contas.map((item, index) => {
                        if(index > 1 )
                            return

                        return (
                            <CardAccount key={index} item={item}/>
                        )
                    })
                }

                <Button 
                    onPress={() => navigation.dispatch(
                        StackActions.replace('StackAccount', 
                        {screen: 'ManageAccount'})
                        )}
                    title="Gerenciar"
                    color="#444"
                    backgroundColor="#F5F2F3"
                /> 
            </ContainerAccount>
        </Container>
    )
}

export default SectionAccount