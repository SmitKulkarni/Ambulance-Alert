# Ambulance Alert Native Mobile App (Flutter)

This directory contains the scaffolding for the Phase 3.2 native mobile app built with Flutter.

## Status: Scaffolding Complete
The core screens from the React web progressive web app (PWA) have been slated for native porting:
1. `HomeTrackingScreen`
2. `AlertsScreen`
3. `ReportHazardScreen`

## Prerequisites
To build and run this native application, you will need to install the following on your host machine:
- [Flutter SDK](https://docs.flutter.dev/get-started/install)
- Android Studio (for Android Emulator)
- Xcode (for iOS Simulator, Mac only)

## Getting Started
Once the prerequisites are installed, you can initialize the Flutter project in this directory:

```bash
flutter create .
flutter run
```

## Push Notifications
Push notifications for the native app are powered by Firebase Cloud Messaging (FCM). 
You will need to configure `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) once your Firebase project is created.
