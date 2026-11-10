import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  buttonWrap: {
    marginTop: 25,
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
    marginTop: 16,
    width: '100%',
  },
  pointBadge: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  pointRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  pointText: {
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
  pointsCard: {
    gap: 18,
  },
  screen: {
    justifyContent: 'flex-start',
  },
  shieldCore: {
    alignItems: 'center',
    borderRadius: 42,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  shieldShell: {
    alignItems: 'center',
    borderRadius: 70,
    height: 148,
    justifyContent: 'center',
    width: 148,
  },
  topSection: {
    gap: 20,
  },
});
