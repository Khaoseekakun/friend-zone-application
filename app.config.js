module.exports = {
    expo: {
        name: "Friend Zone",
        slug: "friend-zone-thailand",
        version: "1.0.0",
        sdkVersion: "52.0.0",
        orientation: "portrait",
        icon: "./assets/images/logo.png",
        scheme: "myapp",
        userInterfaceStyle: "automatic",
        jsEngine: "hermes",
        platforms: ["ios", "android"],
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.friendzone.app",
            infoPlist: {
                NSPhotoLibraryUsageDescription: "We need access to your photo library to select images",
                UIBackgroundModes: ["fetch", "remote-notification"]
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/logo-white.png"
            },
            package: "com.friendzone.app"
        },
        plugins: ["expo-router", "expo-font", "expo-image-picker"],
        experiments: {
            typedRoutes: true
        },
        newArchEnabled: true,
        packagerOpts: {
            config: "metro.config.js",
            sourceExts: [
                "expo.ts",
                "expo.tsx",
                "expo.js",
                "expo.jsx",
                "ts",
                "tsx",
                "js",
                "jsx",
                "json",
                "wasm",
                "svg",
                "png",
                "jpg",
                "jpeg",
                "gif",
                "md"
            ]
        },
        extra: {
            eas: {
                projectId: "297fa62d-35bc-4c58-b833-34c550603cf8"
            }
        },
        build: {
            production: {
                workflow: "managed"
            }
        },
        owner: "sinsamuth"
    }
};