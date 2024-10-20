import React from 'react';
import { AuthProvider, useAuth } from '../utils/context/AuthContext'; // Import AuthProvider
import { AppNavigator } from '@/components/Navigator/App';

export default function App() {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
}
