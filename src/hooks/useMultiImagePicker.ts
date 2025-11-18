import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { IMAGE_MEDIA_TYPE, type PickedImage } from './useImagePicker';

const MAX_IMAGES = 4;

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: [IMAGE_MEDIA_TYPE],
  allowsMultipleSelection: true,
  quality: 1,
};

export function useMultiImagePicker() {
  const [images, setImages] = useState<PickedImage[]>([]);
  const [isPicking, setIsPicking] = useState(false);

  const pickImages = useCallback(async () => {
    if (isPicking) {
      return;
    }
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limit reached', `You can only attach up to ${MAX_IMAGES} images.`);
      return;
    }
    setIsPicking(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission needed',
          'Please allow photo library access to continue.',
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      if (result.canceled || !result.assets?.length) {
        return;
      }
      const newImages: PickedImage[] = result.assets
        .map((asset) => {
          if (!asset?.uri) {
            return null;
          }
          return {
            uri: asset.uri,
            name: asset.fileName ?? asset.assetId ?? 'upload.jpg',
            type: asset.mimeType ?? 'image/jpeg',
          };
        })
        .filter(Boolean) as PickedImage[];
      if (!newImages.length) {
        return;
      }
      setImages((prev) => {
        const next = [...prev, ...newImages];
        return next.slice(0, MAX_IMAGES);
      });
    } catch (error) {
      console.warn('useMultiImagePicker: failed to pick images', error);
      Alert.alert('Error', 'Unable to pick images. Please try again.');
    } finally {
      setIsPicking(false);
    }
  }, [images.length, isPicking]);

  const removeImage = useCallback((uri: string) => {
    setImages((prev) => prev.filter((item) => item.uri !== uri));
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  return {
    images,
    pickImages,
    removeImage,
    clearImages,
    isPicking,
    canAddMore: images.length < MAX_IMAGES,
  };
}
