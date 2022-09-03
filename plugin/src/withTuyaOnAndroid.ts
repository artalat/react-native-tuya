import { AndroidConfig, ConfigPlugin, withAndroidManifest } from '@expo/config-plugins';
import { ExpoConfig } from '@expo/config-types';

import { Props } from './';

// Using helpers keeps error messages unified and helps cut down on XML format changes.
const { addMetaDataItemToMainApplication, getMainApplicationOrThrow } = AndroidConfig.Manifest;

export const withTuyaOnAndroid: ConfigPlugin<Props> = (config, props) => {
	if (!props.androidApiKey) {
		throw new Error(
			'You must provide an androidApiKey to use react-native-tuya. See the docs for more info: https://docs.expo.io/versions/latest/sdk/react-native-tuya/',
		);
	}

	if (!props.androidApiSecret) {
		throw new Error(
			'You must provide an androidApiSecret to use react-native-tuya. See the docs for more info: https://docs.expo.io/versions/latest/sdk/react-native-tuya/',
		);
	}

	return withAndroidManifest(config, async config => {
		// Modifiers can be async, but try to keep them fast.
		config.modResults = await setCustomConfigAsync(config as any, config.modResults, props);
		return config;
	});
};

// Splitting this function out of the mod makes it easier to test.
async function setCustomConfigAsync(
	config: Pick<ExpoConfig, 'android'>,
	androidManifest: AndroidConfig.Manifest.AndroidManifest,
	props: Props
): Promise<AndroidConfig.Manifest.AndroidManifest> {
	// Get the <application /> tag and assert if it doesn't exist.
	const mainApplication = getMainApplicationOrThrow(androidManifest);

	addMetaDataItemToMainApplication(
		mainApplication,
		// value for `android:name`
		'TUYA_SMART_APPKEY',
		// value for `android:value`
		props.androidApiKey
	);

	addMetaDataItemToMainApplication(
		mainApplication,
		// value for `android:name`
		'TUYA_SMART_SECRET',
		// value for `android:value`
		props.androidApiSecret
	);

	return androidManifest;
}
