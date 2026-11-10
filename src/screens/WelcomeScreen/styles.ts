import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  featureCard: {
    marginTop: 24,
  },
  footer: {
    justifyContent: 'flex-end',
  },
  heroArt: {
    alignItems: 'center',
    borderRadius: 32,
    height: 170,
    justifyContent: 'center',
    width: 170,
  },
  heroBlock: {
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
    width: '100%',
  },
  heroChip: {
    borderRadius: 999,
    height: 18,
    position: 'absolute',
    width: 18,
  },
  heroChipBottom: {
    bottom: 28,
    right: 48,
  },
  heroChipLeft: {
    left: 28,
    top: 78,
  },
  heroChipRight: {
    right: 28,
    top: 34,
  },
  heroTitle: {
    maxWidth: 320,
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
  phoneBody: {
    gap: 8,
    marginTop: 14,
  },
  phoneCard: {
    borderRadius: 22,
    height: 110,
    padding: 14,
    width: 82,
  },
  phoneHeader: {
    borderRadius: 8,
    height: 22,
    width: '100%',
  },
  phoneLine: {
    borderRadius: 999,
    height: 8,
  },
  phoneLineLong: {
    width: 48,
  },
  phoneLineShort: {
    width: 34,
  },
  platformBadgeImage: {
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  platformLabel: {
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
  platformList: {
    gap: 14,
  },
  platformRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  screen: {
    justifyContent: 'space-between',
  },
  screenIos: {
    justifyContent: 'center',
  },
  secondaryAction: {
    marginTop: 12,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 27,
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
});
