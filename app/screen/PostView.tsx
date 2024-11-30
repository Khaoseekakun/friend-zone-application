import { HeaderApp } from '@/components/Header'
import FireBaseApp from '@/utils/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { getStorage } from 'firebase/storage';
import { styled } from 'nativewind';
import React from 'react'
import { Image, Text, View } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';



const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyleImageViewer = styled(ImageViewer);
const StyledIonicons = styled(Ionicons);
const storage = getStorage(FireBaseApp);

export default function PostView() {
    return (
        <>
            <StyledView className="flex-1 bg-white dark:bg-neutral-900">
                <HeaderApp />
            </StyledView>
        </>
    )
}