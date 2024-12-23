import LocationMonitor from "@/components/Gps";
import { Stack } from "expo-router";
import React from "react";

const RootLayout = () => {
    LocationMonitor()
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ headerShown: false }}
            />
        </Stack>
    );
};

export default RootLayout;
