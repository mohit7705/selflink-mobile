import { NativeModules } from 'react-native';

if (!NativeModules.NativeUnimoduleProxy) {
  NativeModules.NativeUnimoduleProxy = {
    modulesConstants: {},
    viewManagersMetadata: {},
  } as unknown as typeof NativeModules.NativeUnimoduleProxy;
}

if (!NativeModules.UIManager) {
  NativeModules.UIManager = {
    RCTView: {
      directEventTypes: {},
    },
  } as unknown as typeof NativeModules.UIManager;
}
