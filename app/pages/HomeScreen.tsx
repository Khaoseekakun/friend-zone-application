import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text>Welcome to Friend Zone</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5FCFF",
    },
});
