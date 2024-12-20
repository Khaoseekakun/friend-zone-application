import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledIonIcon = styled(Ionicons)
const StyledTouchableOpacity = styled(TouchableOpacity)

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // สามารถส่ง log ไปยัง service เช่น Sentry ได้
    console.error("Error caught in ErrorBoundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <StyledView className="flex-1 justify-center items-center bg-white dark:bg-neutral-900">
          <StyledIonIcon name="alert-circle-outline" size={48} color="red" />
          <StyledText className="text-red-500 dark:text-red-400 text-lg font-bold">Something went wrong!</StyledText>
          <StyledTouchableOpacity onPress={() => this.setState({ hasError: false })}>
            <StyledText className="text-blue-500 dark:text-blue-400">Try again</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      )
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
