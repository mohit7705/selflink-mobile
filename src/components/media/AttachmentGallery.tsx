import { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import type { Attachment } from '@utils/attachments';

type Props = {
  attachments: Attachment[];
  mode?: 'default' | 'compact';
};

function AttachmentGalleryComponent({ attachments, mode = 'default' }: Props) {
  if (!attachments.length) {
    return null;
  }

  return (
    <View style={styles.gallery}>
      {attachments.map((attachment, index) => {
        const layout = getAttachmentLayout(index, attachments.length, mode);
        return (
          <View key={attachment.key} style={[styles.attachment, layout]}>
            <Image
              source={{ uri: attachment.uri }}
              style={styles.mediaImage}
              resizeMode="cover"
            />
          </View>
        );
      })}
    </View>
  );
}

const getAttachmentLayout = (index: number, count: number, mode: Props['mode']) => {
  const base = mode === 'compact' ? compactStyles : posterStyles;
  if (count === 1) {
    return base.single;
  }
  if (count === 2) {
    return base.pair;
  }
  if (count === 3) {
    return index === 0 ? base.hero : base.support;
  }
  if (count === 4) {
    return base.quad;
  }
  return base.masonry;
};

export const AttachmentGallery = memo(AttachmentGalleryComponent);

const styles = StyleSheet.create({
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  attachment: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
});

const posterStyles = StyleSheet.create({
  single: {
    width: '100%',
    minHeight: 240,
  },
  pair: {
    width: '48%',
    minHeight: 180,
  },
  hero: {
    width: '100%',
    minHeight: 220,
  },
  support: {
    width: '48%',
    minHeight: 140,
  },
  quad: {
    width: '48%',
    minHeight: 160,
  },
  masonry: {
    width: '31%',
    minHeight: 120,
  },
});

const compactStyles = StyleSheet.create({
  single: {
    width: '100%',
    minHeight: 180,
  },
  pair: {
    width: '48%',
    minHeight: 140,
  },
  hero: {
    width: '100%',
    minHeight: 160,
  },
  support: {
    width: '48%',
    minHeight: 120,
  },
  quad: {
    width: '48%',
    minHeight: 130,
  },
  masonry: {
    width: '31%',
    minHeight: 110,
  },
});
