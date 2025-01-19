module.exports = {
    expo: {
        name: "Friend Zone",
        slug: "friends-zone-thailand",  // Keep this slug
        version: "1.0.2",
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
                projectId: "96010b44-a225-4977-9f58-a86fc4abd9b5",
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
