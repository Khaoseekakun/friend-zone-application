import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, Linking } from 'react-native';
import * as Location from 'expo-location';

export default function LocationMonitor() {
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [gpsEnabled, setGpsEnabled] = useState(true);
    const checkLocationStatus = async () => {
        try {
            // Check permission status
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
                if (permissionGranted) {
                    // Trigger event when permission changes to denied
                    Alert.alert(
                        'คำเตือน',
                        'แอพพลิเคชั่นไม่สามารถเข้าถึงตำแหน่งของคุณได้ กรุณาเปิดการอนุญาต',
                        [
                            { text: 'ปิดแอพ', onPress: () => BackHandler.exitApp(), style: 'cancel' },
                        ]
                    );
                }
                setPermissionGranted(false);
                return;
            }
            setPermissionGranted(true);

            // Check GPS status
            const isLocationEnabled = await Location.hasServicesEnabledAsync();
            if (!isLocationEnabled && gpsEnabled) {
                // Trigger event when GPS is disabled
                Alert.alert(
                    'คำเตือน',
                    'GPS ถูกปิด กรุณาเปิด GPS เพื่อใช้งานแอพ',
                    [
                        { text: 'ปิดแอพ', onPress: () => BackHandler.exitApp(), style: 'cancel' },
                    ]
                );
            }
            setGpsEnabled(isLocationEnabled);
        } catch (error) {
            console.error('Error checking location status:', error);
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            checkLocationStatus();
        }, 1000);

        return () => clearInterval(intervalId);
    }, [permissionGranted, gpsEnabled]);
}
