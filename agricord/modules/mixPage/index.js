import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { connect } from 'react-redux';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import Switch from 'react-native-customisable-switch';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faCheckCircle, faTimesCircle, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Color, BasicStyles } from 'common';
import MixCard from './mixCard';
import Style from './Style.js';
import SlidingButton from 'modules/generic/SlidingButton';
import MixConfirmationModal from 'modules/modal/MixConfirmation';
import Draggable from 'react-native-draggable';
import _ from 'lodash';
const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);

const availablePaddocks = [
  {
    id: 1,
    name: 'A',
    crop: 'WHEAT',
    area: '52ha',
    remaining_area: '52ha'
  },
  {
    id: 2,
    name: 'B',
    crop: 'WHEAT',
    area: '62ha',
    remaining_area: '62ha'
  },
  {
    id: 3,
    name: 'C',
    crop: 'WHEAT',
    area: '72ha',
    remaining_area: '72ha'
  },
  {
    id: 4,
    name: 'D',
    crop: 'WHEAT',
    area: '82ha',
    remaining_area: '82ha'
  },
  {
    id: 5,
    name: 'E',
    crop: 'WHEAT',
    area: '92ha',
    remaining_area: '92ha'
  },
]

const MixPage = (props) => {

  const carouselRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [scanProductFlag, setScanProductFlag] = useState(true)
  const [selectedFlag, setSelectedFlag ] = useState(false)
  const [appRateSwitch, setAppRateSwitch] = useState(false)
  const [availablePaddockIndex, setAvailablePaddockIndex] = useState(0)
  const [selectedPaddockIndex, setSelectedPaddockIndex] = useState(0)
  const [mixConfirmation, setMixConfirmation] = useState(false)
  const [selectedPaddock, setSelectedPaddock] = useState([])
  const [totalArea, setTotalArea] = useState(0)
  const [paddocks, setPaddocks] = useState(availablePaddocks)

  // THIS IS A FIX FOR NOT RENDERING THE PADDOCK CARDS ONCE THIS COMPONENT IS MOUNTED
  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 100)
  }, [])

  if (loading) return null

  const redirect = (route) => {
    const { task } = props.state;
    props.setTask({
      ...task,
      data: selectedPaddock,
      params: {
        volume: 120,
        units: 'L',
        area: 64,
        area_units: 'HA'
      }
    })
    setTimeout(() => {
      setMixConfirmation(false)
      props.navigation.navigate(route)
    }, 100)
  }

  const removePaddock = (from, item) => {
    if(from == 'selected'){
      const newSelectedPaddock = selectedPaddock.filter((paddock, idx) => {
      if(paddock.id != item.id){
          return item
        }
      })
      setSelectedPaddock(newSelectedPaddock)
      setPaddocks([...paddocks, ...[item]])
    }else{
      const newPaddocks = paddocks.filter((paddock, idx) => {
        if(paddock.id != item.id){
          return item
        }
      })
      setPaddocks((newPaddocks != null && newPaddocks.length > 0) ? newPaddocks : [])
    }
  }



  const addToSelected = (item) => {
    setSelectedFlag(true)
    let status = false
    for (var i = 0; i < selectedPaddock.length; i++) {
      let paddock = selectedPaddock[i]
      if(paddock.id == item.id){
        status = true
        break
      }
    }
    if(status == false){
      setSelectedPaddock([...selectedPaddock, ...[item]])  
      removePaddock('available', item)
    }else{
      console.log('already existed')

      Alert.alert(
        'Error Message',
        item.name + ' already exist!',
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') }
        ],
        { cancelable: false }
      );

    }

  }


  const selectedPaddockView = () => {
    return(
      <View style={{
        marginBottom: 100
      }}>
        <Text style={Style.textHeader}>Selected Paddocks</Text>
        <View style={{ alignItems: 'center', position: 'relative' }}>
          <Carousel
            layout={"default"}
            ref={carouselRef}
            data={selectedPaddock}
            sliderWidth={width}
            itemWidth={width * 0.9}
            renderItem={(data) => (
              <MixCard data={data}
                hasCheck={true}
                addToSelected={() => {}}
                removePaddock={(from, item) => removePaddock(from, item)}
                from={'selected'}/>
            )}
            onSnapToItem = { index => setSelectedPaddockIndex(index) }
          />
          <Pagination
            dotsLength={selectedPaddock.length}
            activeDotIndex={selectedPaddockIndex}
            containerStyle={{ 
              width: '50%',
              position: 'absolute',
              bottom: -40,
            }}
            dotStyle={{
              width: 10,
              height: 10,
              borderRadius: 5,
              marginHorizontal: -5,
              backgroundColor: '#5A84EE'
            }}
            inactiveDotStyle={{
              backgroundColor: '#C4C4C4'
            }}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
          />
        </View>
      </View>
    )
  }

  const applicationRate = () => {
    const { task } = props.state;

    return (
        <View style={[
          Style.mixCardContainer,
          {
            marginTop: 25,
            minHeight: 50,
            width: '90%',
            marginLeft: '5%',
            marginRight: '5%',
            zIndex: 1,
            marginBottom: (selectedPaddock.length == 0 || (selectedPaddock.length > 0 &&  selectedFlag == false)) ? (height / 2) : 0
          }]
        }>
          <View style={
            [ Style.mixTitle, 
            { borderBottomWidth: 3, borderBottomColor: '#9AD267' }]
          }>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[Style.textBold, { marginRight: 5, fontSize: 15 }]}>
                Application rate
              </Text>
              <FontAwesomeIcon
                size={16}
                icon={faCheckCircle}
                color={'#BBF486'}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: -15 }}>
              <Text style={{ fontSize: 12, marginRight: 3 }}>Last Load?</Text>
              <Switch
                value={appRateSwitch}
                onChangeValue={() => setAppRateSwitch(!appRateSwitch)}
                activeText={'ON'}
                inactiveText={'OFF'}
                fontSize={16}
                activeTextColor={'rgba(255, 255, 255, 1)'}
                inactiveTextColor={'rgba(255, 255, 255, 1)'}
                activeBackgroundColor={'#9AD267'}
                inactiveBackgroundColor={'#C6C6C6'}
                activeButtonBackgroundColor={'rgba(255, 255, 255, 1)'}
                inactiveButtonBackgroundColor={'#F2F2F2'}
                switchHeight={25}
                switchBorderRadius={5}
                buttonWidth={30}
                buttonHeight={20}
                buttonBorderRadius={5}
                animationTime={150}
                padding={true}
              />
            </View>
          </View>

          <View style={[Style.mixDetails, { flexDirection: 'column' }]}>
            <View style={Style.appliedRate}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LinearGradient
                  colors={['#ABD770', '#D3E584']}
                  style={{
                    height: 15,
                    width: 15,
                    borderRadius: 7.5,
                    marginRight: 5
                  }}
                />
                <Text>Applied Rate</Text>
              </View>
              <View>
                { task && task.spray_mix && (
                    <Text style={Style.textBold}>{task.spray_mix.application_rate}/Ha</Text>
                  )
                  
                }
              </View>
            </View>
            <View style={{ width: '100%', flex: 1, alignItems: 'flex-start' }}>
              {

              }
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                
                <View style={Style.totalAreaBox}>
                  <Text>{totalArea} Ha</Text>
                  <Text style={{ color: '#5A84EE', fontWeight: 'bold' }}>
                    TOTAL AREA
                  </Text>
                </View>  

                {
                  (task && task.machine) && (
                    <View style={{ marginTop: 5, paddingLeft: 10 }}>
                      <Text style={{ color: '#5A84EE', fontWeight: 'bold' }}>
                        MAX AREA: {parseFloat(task.machine.capacity / task.spray_mix.maximum_rate).toFixed(2)}HA
                      </Text>
                    </View>    
                  )
                }
                
              </View>
             
              {
                (selectedPaddock.length > 0) && (

                  <View style={{
                    flexDirection: 'row',
                    width: '100%',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    marginTop: 10
                  }}>
                    {
                      selectedPaddock.map((item, index) => (
                       <View 
                        style={[Style.appliedPaddock, {
                          width: '48%',
                          justifyContent: 'space-between',
                        }]}
                        >
                        <Text style={Style.appliedPaddockText}>
                          {item.name}
                        </Text>
                        <TouchableOpacity
                          style={{
                            width: 30,
                            alignItems: 'flex-end'
                          }}
                          onPress={() => removePaddock('selected', item)}
                          >
                          <FontAwesomeIcon size={12} icon={faTimesCircle} color={'#094EFF'} />
                        </TouchableOpacity>
                       </View>
                      ))
                    }
                  </View>
                )
              }
            </View>
          </View>
          {
            (selectedPaddock.length > 0) && (
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  width: '100%',
                  backgroundColor: selectedFlag ? '#676767' : Color.blue,
                  borderBottomLeftRadius: BasicStyles.standardBorderRadius,
                  borderBottomRightRadius: BasicStyles.standardBorderRadius,
                }}
                onPress={() => setSelectedFlag(selectedFlag ? false : true) }
                >
                  <Text style={{
                    fontSize: BasicStyles.standardTitleFontSize,
                    fontWeight: 'bold',
                    paddingTop: 10,
                    paddingBottom: 10,
                    color: Color.white
                  }}>
                    {
                      selectedFlag ? 'Hide paddock details' : 'Show paddock details'
                    }
                  </Text>
              </TouchableOpacity>
            )
          }
        </View>
      );
  }

  const availablePaddocksView = () => {
    return(
      <View style={{
          marginTop: 15
        }}>
        <Text style={Style.textHeader}>Available Paddocks</Text>
        <View style={{ alignItems: 'center', position: 'relative' }}>

           <Carousel
              layout={"default"}
              ref={carouselRef}
              data={paddocks}
              sliderWidth={width}
              itemWidth={width * 0.9}
              activeDo
              renderItem={(data) => (
                  <MixCard data={data}
                    hasCheck={false}
                    addToSelected={(item) => addToSelected(item)}
                    from={'available'}
                    removePaddock={(from, item) => removePaddock(from, item)}
                    />
              )}
              onSnapToItem = { index => setAvailablePaddockIndex(index) }
            />

          <Text style={{
            position: 'absolute',
            bottom: -20,
            left: '12%',
            fontSize: 10,
            color: '#C0C0C0',
            width: 100
          }}>
            Drag Paddock tile to Appliction Box
          </Text>
          <Pagination
            dotsLength={paddocks.length}
            activeDotIndex={availablePaddockIndex}
            containerStyle={{ 
              width: '50%',
              position: 'absolute',
              bottom: -40,
            }}
            dotStyle={{
              width: 10,
              height: 10,
              borderRadius: 5,
              marginHorizontal: -5,
              backgroundColor: '#5A84EE'
            }}
            inactiveDotStyle={{
              backgroundColor: '#C4C4C4'
            }}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
          />
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, position: 'relative', backgroundColor:  Color.containerBackground}}>
      <ScrollView showsVerticalScrollIndicator={false} style={Style.ScrollView}>

        {(paddocks != null && paddocks.length > 0) && availablePaddocksView()}
       
        {applicationRate()}

        { (selectedFlag && selectedPaddock.length > 0) && ( selectedPaddockView()) }


      </ScrollView>
      {
        scanProductFlag && (
          <SlidingButton
            title={'Create Batch'}
            label={'Swipe Right'}
            onSuccess={() => setMixConfirmation(true)}
          />
        )
      }

      {
        (mixConfirmation) && (
          <MixConfirmationModal
            visible={mixConfirmation}
            onClose={() => setMixConfirmation(false)}
            onSuccess={() => redirect('batchStack')}
            data={selectedPaddock}
            volume={'BATCH 64HA 4, 160 L'}
          />
        )
      }
    </SafeAreaView>
  );
}
const mapStateToProps = state => ({state: state});
const mapDispatchToProps = dispatch => {
  const {actions} = require('@redux');
  return {
    setTask: (task) => dispatch(actions.setPaddock(task)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MixPage);
