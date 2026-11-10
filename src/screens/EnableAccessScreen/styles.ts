import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  bellIcon: {
    fontSize: 62,
    lineHeight: 66,
  },
  bellShell: {
    alignItems: 'center',
    borderRadius: 68,
    height: 136,
    justifyContent: 'center',
    width: 136,
  },
  buttonWrap: {
    marginTop: 8,
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
    gap: 20,
    marginTop: 18,
    width: '100%',
  },
  screen: {
    justifyContent: 'flex-start',
  },
  stepNumber: {
    minWidth: 18,
  },
  stepRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  stepsCard: {
    gap: 20,
  },
  stepText: {
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      },
      ios: {
        fontFamily: 'AvenirNext-Medium',
      },
    }),
    fontSize: 16,
    lineHeight: 22,
  },
  tipBadge: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  tipCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  tipCopy: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      },
      ios: {
        fontFamily: 'AvenirNext-Medium',
      },
    }),
  },
  topSection: {
    gap: 22,
  },
});
