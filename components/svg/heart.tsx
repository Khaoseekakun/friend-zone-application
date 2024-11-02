import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function HeartIcon() {
    return (
        <Svg width={18} height={15} viewBox="0 0 18 15" fill="none">
            <Path
                d="M8.82494 15C8.70882 15.0007 8.5937 14.9784 8.48619 14.9345C8.37869 14.8906 8.28091 14.8259 8.19846 14.7441L1.34239 7.87921C0.482394 7.01022 0 5.837 0 4.61441C0 3.39182 0.482394 2.21861 1.34239 1.34962C2.20912 0.485342 3.38318 0 4.60718 0C5.83119 0 7.00525 0.485342 7.87198 1.34962L8.82494 2.30259L9.77791 1.34962C10.6446 0.485342 11.8187 0 13.0427 0C14.2667 0 15.4408 0.485342 16.3075 1.34962C17.1675 2.21861 17.6499 3.39182 17.6499 4.61441C17.6499 5.837 17.1675 7.01022 16.3075 7.87921L9.45143 14.7441C9.36898 14.8259 9.2712 14.8906 9.16369 14.9345C9.05619 14.9784 8.94107 15.0007 8.82494 15Z"
                fill="url(#paint0_linear)"
            />
            <Defs>
                <LinearGradient id="paint0_linear" x1="0" y1="7.5" x2="17.6499" y2="7.5" gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#EA4080" />
                    <Stop offset="0.265" stopColor="#EB5177" />
                    <Stop offset="1" stopColor="#EE805F" />
                </LinearGradient>
            </Defs>
        </Svg>
    );
}
