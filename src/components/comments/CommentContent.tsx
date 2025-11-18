import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AttachmentGallery } from '@components/media/AttachmentGallery';
import type { MediaAsset } from '@schemas/social';
import { buildAttachments } from '@utils/attachments';

import { MarkdownText } from '../markdown/MarkdownText';

type Props = {
  text?: string | null;
  media?: MediaAsset[] | null;
  legacySources?: unknown[];
};

function CommentContentComponent({ text, media, legacySources = [] }: Props) {
  const attachments = useMemo(
    () => buildAttachments({ media, legacySources }),
    [legacySources, media],
  );

  return (
    <View style={styles.container}>
      {text ? (
        <View style={styles.body}>
          <MarkdownText>{text}</MarkdownText>
        </View>
      ) : null}
      <AttachmentGallery attachments={attachments} mode="compact" />
    </View>
  );
}

export const CommentContent = memo(CommentContentComponent);

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  body: {
    gap: 4,
  },
});
