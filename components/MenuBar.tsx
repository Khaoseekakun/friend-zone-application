import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, Dimensions, Image } from "react-native";
import { getPathDown } from "./curve";
import { Svg, Path } from "react-native-svg";
import { scale } from "react-native-size-scaling";
import ProfileTab from "@/app/screen/Profile";
import FeedsTab from "@/app/screen/Feeds";
import Setting from "@/app/screen/Setting";
import Message from "@/app/screen/SearchCategory";

const Tab = createBottomTabNavigator();
export const BottomTabNavigator = () => {
  const [maxWidth, setMaxWidth] = useState(Dimensions.get("window").width);
  console.log(maxWidth)
  const returnpathDown = getPathDown(375, 60, 50);



  // tabBarLabel: () => (
  //   <View>
  //     <Svg width={maxWidth} height={scale(60)}>
  //       <Path fill={"white"} {...{ d: returnpathDown }} />
  //     </Svg>
  //   </View>
  // ),

  return (
    <>
    <View>
      <Svg width={maxWidth} height={scale(60)} style={{backgroundColor:"transparent"}}>
        <Path fill={"white"} {...{ d: returnpathDown }} />
      </Svg>
    </View>
    
    
    </>
  )
};