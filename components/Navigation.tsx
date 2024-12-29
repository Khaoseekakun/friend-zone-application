import { Appearance, Text, View } from "react-native";
import Svg, { Path } from 'react-native-svg';
import { Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import axios from "axios";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledIonicons = styled(Ionicons);
const originalWidth = 411;
const originalHeight = 80;

const aspectRatio = originalWidth / originalHeight;
const windowWidth = Dimensions.get("screen").width;
const tabWidth = windowWidth / 5;

const svgList = [
  "M 42 40 C 56.5065 40 68.9005 31.6257 75.2877 19.2662 C 80.3588 9.4534 88.8643 0 99.91 0 H 386.993 C 400.252 0 411 11.1929 411 25 V 70 C 411 80 411 80 411 80 H 9.6029 C 0 80 0 80 0 80 V 25 C 0 11.1929 -0 20.5 0.0001 7 V 7 C 0.7048 5.4035 3.4777 5.8948 3.8033 7.6093 C 7.3073 26.0615 23.2847 40 42 40 Z",
  "M123,40 C137.507,40,149.903,31.6257,156.29,19.2662 C161.361,9.45338,169.864,0,180.91,0 H386.993 C400.252,0,411,11.1929,411,25 V70 C411,80,411,80,411,80 H9.60281 C0,80,0,80,0,80 V25 C0,11.1929,10.7483,0,24.007,0 H64.09 C75.1357,0,83.6739,9.4763,88.91,19.202 C95.583,31.5967,108.468,40,123,40 Z",
  "M 206 40 C 191.493 40 179.097 31.6257 172.71 19.2662 C 167.639 9.4534 159.136 0 148.09 0 H 24.0071 C 10.7484 0 -0 11.1929 -0 25 V 70 C -0 80 0 80 0 80 H 401.397 C 411 80 411 80 411 80 V 25 C 411 11.1929 400.252 0 386.993 0 H 264.91 C 253.864 0 245.326 9.4763 240.09 19.202 C 233.417 31.5967 220.532 40 206 40 Z",
  "M 288 40 C 273.493 40 261.097 31.6257 254.71 19.2662 C 249.639 9.4534 241.136 0 230.09 0 H 24.0071 C 10.7484 0 -0 11.1929 -0 25 V 70 C -0 80 0 80 0 80 H 401.397 C 411 80 411 80 411 80 V 25 C 411 11.1929 400.252 0 386.993 0 H 346.91 C 335.864 0 327.326 9.4763 322.09 19.202 C 315.417 31.5967 302.532 40 288 40 Z",
  "M 369 40 C 354.493 40 342.1 31.6257 335.712 19.2662 C 330.641 9.4534 322.136 0 311.09 0 H 24.0071 C 10.7484 0 0 11.1929 0 25 V 70 C 0 80 0 80 0 80 H 401.397 C 411 80 411 80 411 80 V 25 C 411 11.1929 411 20.5 411 7 V 7 C 410.295 5.4035 407.522 5.8948 407.197 7.6093 C 403.693 26.0615 387.715 40 369 40 Z"
];

const pageNumber = {
  "FeedsTab": 0,
  "SearchCategory": 1,
  "FastTab": 2,
  "SchedulePage": 3,
  "MessageTab": 4
};

type TypeParams = "FeedsTab" | "SearchCategory" | "FastTab" | "SchedulePage" | "MessageTab";

const icons = ["home", "search", "flash", "calendar", "chatbubbles"];
const iconNames = ["Home", "Search", "Fast", "Schedule", "Message"];
interface NavigationProps {
  current: TypeParams;
}

export const Navigation: React.FC<NavigationProps> = ({ current }) => {

  const navigation = useNavigation<NavigationProp<any>>();

  const handlePress = async(index: number, screen: string) => {
    navigation.navigate(screen, { backPage: current });
  };

  const [theme, setTheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });

    return () => listener.remove();
  }, [])

  return (
    <StyledView style={{
      width: windowWidth,
      aspectRatio,
      position: 'absolute',
      bottom: 0,

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,

      elevation: 5,
      backgroundColor: 'transparent'
    }}

    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${originalWidth} ${originalHeight}`}
        fill="none"
        style={{
          shadowColor: '#171717',
          shadowOffset: { width: -2, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
        }}
      >
        <Path
          d={svgList[pageNumber[current]]}
          fill={theme === "light" ? "#fff" : "#262626"}
        />
      </Svg>

      <StyledView style={{
        width: "100%",
        height: "100%",
        position: "relative",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        {Object.keys(pageNumber).map((page, index) => (
          <StyledView key={index} style={{ width: tabWidth, alignItems: "center" }}>
            {pageNumber[current] === index && (
              <StyledView
                className="absolute w-[65px] h-[65px] bg-white dark:bg-[#262626] bottom-[95px] rounded-full"
              />
            )}
          </StyledView>
        ))}
      </StyledView>

      <StyledView style={{
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
      }}>
        {icons.map((iconName, index) => (

          <StyledView
            key={`styled-${iconName}-${index}`}
            style={{
              width: windowWidth / 5,
              justifyContent: "center",
              alignItems: "center",
              bottom: 80,
            }}>
            <StyledIonicons
              key={`${iconName}-${index}`}
              name={index === pageNumber[current] ? icons[index] : `${icons[index]}-outline` as any}
              size={30}
              onPress={() => handlePress(index, Object.keys(pageNumber)[index])}
              style={{
                position: "relative",
                bottom: index === pageNumber[current] ? 100 : 60,
              }}

              className="text-[#ad2722] dark:text-white"

            />
            <StyledText className="relative font-bold font-custom bottom-[55] text-[#ad2722] dark:text-white">
              {`${iconNames[index]}`}
            </StyledText>
          </StyledView>
        ))}
      </StyledView>

    </StyledView >
  );
}
