import {Stack} from "expo-router";
import { Tabs } from "expo-router"
import React from "react"

export default () => {
    return (
        <Stack>
            <Stack.Screen name="Home"
            options={{headerShown:false}}

            />
        </Stack>
    )
}