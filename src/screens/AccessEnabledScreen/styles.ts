import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  buttonWrap: {
    marginTop: 8,
  },
  checkCore: {
    alignItems: 'center',
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  checkMark: {
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-black',
      },
      ios: {
        fontFamily: 'AvenirNext-Heavy',
      },
    }),
  },
  checkShell: {
    alignItems: 'center',
    borderRadius: 74,
    height: 148,
    justifyContent: 'center',
    width: 148,
  },
  copy: {
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 320,
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
  heading: {
    maxWidth: 320,
    textAlign: 'center',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-black',
        fontSize: 34,
        letterSpacing: 0.2,
        lineHeight: 40,
      },
      default: {
        fontSize: 33,
        lineHeight: 39,
      },
      ios: {
        fontFamily: 'AvenirNext-Heavy',
        fontSize: 33,
        letterSpacing: 0.2,
        lineHeight: 39,
      },
    }),
  },
  heroBlock: {
    alignItems: 'center',
    gap: 18,
    marginTop: 0,
    width: '100%',
  },
  screen: {
    justifyContent: 'center',
  },
  topSection: {
    alignItems: 'stretch',
    gap: 22,
  },
});
