# 📱 Budowanie aplikacji mobilnej

Aplikacja webowa jest pakowana do natywnych aplikacji **Android** i **iOS** przez
[Capacitor](https://capacitorjs.com/). Ten sam kod = web (PWA) + Android + iOS.

## Wymagania wstępne

```bash
npm install
```

Zawsze buduj web bundle w trybie mobilnym (ścieżki względne `./`):

```bash
BUILD_TARGET=mobile npm run build
```

## 🤖 Android

### Lokalnie
Wymaga Android Studio (SDK + JDK 17).

```bash
BUILD_TARGET=mobile npm run build
npx cap add android
npx cap sync android
npx cap open android      # otwiera Android Studio
# lub od razu APK:
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

### W chmurze (GitHub Actions)
Workflow [`mobile-build.yml`](../.github/workflows/mobile-build.yml) buduje **debug APK**
automatycznie:

- Ręcznie: zakładka **Actions → Build Android APK → Run workflow**.
- Albo otaguj wydanie: `git tag v0.1.0 && git push --tags`.

APK pobierzesz z artefaktów uruchomienia (`ai-nauczyciel-debug-apk`).

> Build produkcyjny do Google Play wymaga podpisania kluczem (`keystore`).
> Dodaj sekrety repo i `signingConfig` w `android/app/build.gradle`.

## 🍎 iOS

Wymaga **macOS + Xcode** (Apple nie pozwala budować iOS na Linux/Windows).

```bash
BUILD_TARGET=mobile npm run build
npx cap add ios
npx cap sync ios
npx cap open ios          # otwiera Xcode
```

W Xcode: wybierz zespół (Signing & Capabilities), podłącz iPhone'a lub symulator i
kliknij ▶. Publikacja do App Store przez App Store Connect (wymaga konta Apple Developer).

> macOS runner można dodać w GitHub Actions (`runs-on: macos-14`), by budować iOS w CI.

## 🌐 PWA (bez sklepów)

Aplikacja jest też instalowalna prosto z przeglądarki dzięki `manifest.webmanifest`
i ikonom — na Androidzie „Dodaj do ekranu głównego", na iOS przez Safari → Udostępnij →
„Do ekranu początkowego".
