import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  backgroundWaves: {
    bottom: -88,
    left: -8,
    position: 'absolute',
    right: -8,
  },
  brandName: {
    marginTop: 28,
    textAlign: 'center',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-black',
        fontSize: 36,
        letterSpacing: 0.2,
        lineHeight: 42,
      },
      default: {
        fontSize: 35,
        lineHeight: 41,
      },
      ios: {
        fontFamily: 'AvenirNext-Heavy',
        fontSize: 35,
        letterSpacing: 0.2,
        lineHeight: 41,
      },
    }),
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  copy: {
    fontSize: 17,
    lineHeight: 30,
    marginTop: 18,
    maxWidth: 260,
    textAlign: 'center',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      },
      ios: {
        fontFamily: 'AvenirNext-Medium',
      },
    }),
  },
  currencyBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 40,
    borderWidth: 1,
    height: 104,
    justifyContent: 'center',
    width: 104,
  },
  currencyGlyph: {
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-black',
      },
      ios: {
        fontFamily: 'AvenirNext-Heavy',
      },
    }),
    fontSize: 52,
    lineHeight: 58,
  },
  screen: {
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  wave: {
    alignSelf: 'center',
    borderRadius: 320,
    borderWidth: 1,
    position: 'absolute',
  },
  waveLarge: {
    height: 260,
    width: 420,
  },
  waveLargeBorder: {
    borderColor: 'rgba(164, 180, 255, 0.28)',
  },
  waveMedium: {
    bottom: 18,
    height: 220,
    width: 360,
  },
  waveMediumBorder: {
    borderColor: 'rgba(114, 133, 255, 0.32)',
  },
  waveSmall: {
    bottom: 38,
    height: 180,
    width: 300,
  },
  waveSmallBorder: {
    borderColor: 'rgba(85, 102, 255, 0.36)',
  },
});
