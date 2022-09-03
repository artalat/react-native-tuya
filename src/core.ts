import { NativeModules } from 'react-native';

const CoreNativeApi = NativeModules.TuyaCoreModule;

export function initWithOptions(params: { appKey: string, appSecret: string }) {
	CoreNativeApi.initWithOptions(params);
}
