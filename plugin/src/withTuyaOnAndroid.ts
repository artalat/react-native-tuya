import {
	AndroidConfig,
	ConfigPlugin,
	withAndroidManifest,
	withAppBuildGradle,
	withMainApplication,
	withProjectBuildGradle
} from '@expo/config-plugins';
import { mergeContents, MergeResults } from '@expo/config-plugins/build/utils/generateCode';
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

	withAppBuildGradleImport(config, props);
	withProjectBuildGradleVersion(config, props);
	withTuyaMainApplication(config, props);

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

const withProjectBuildGradleVersion: ConfigPlugin<Props> = (
	config,
	props
) => {
	return withProjectBuildGradle(config, (config) => {
		if (config.modResults.language !== 'groovy')
			throw new Error(
				'react-native-tuya config plugin does not support Kotlin /build.gradle yet.'
			);
		config.modResults.contents = addTuyaMavenRepository(
			config.modResults.contents,
			props
		).contents;

		return config;
	});
};

function addTuyaMavenRepository(src: string, props: Props) {
	const newSrc = [];
	newSrc.push('        // In case of error, make sure to add the following in the repository section');
	newSrc.push('        maven { url "https://maven-other.tuya.com/repository/maven-releases/" }');

	return mergeContents({
		tag: 'react-native-tuya',
		src,
		newSrc: newSrc.join('\n'),
		anchor: /allprojects(?:\s+)?\{/,
		offset: 2,
		comment: '//',
	});
}

const withAppBuildGradleImport: ConfigPlugin<Props> = (
	config,
	props
) => {
	return withAppBuildGradle(config, (config) => {
		if (config.modResults.language !== 'groovy')
			throw new Error(
				'react-native-tuya config plugin does not support Kotlin app/build.gradle yet.'
			);

		config.modResults.contents = addPackageOptions(config.modResults.contents, props).contents;
		return config;
	});
};

function addPackageOptions(src: string, props: Props) {
	const newSrc = [];
	newSrc.push(`
  packagingOptions {
    pickFirst '**/armeabi-v7a/libc++_shared.so'
    pickFirst '**/x86/libc++_shared.so'
    pickFirst '**/arm64-v8a/libc++_shared.so'
    pickFirst '**/x86_64/libc++_shared.so'
    pickFirst '**/x86/libjsc.so'
    pickFirst '**/armeabi-v7a/libjsc.so'
  }`);

	return mergeContents({
		tag: 'react-native-tuya',
		src,
		newSrc: newSrc.join('\n'),
		anchor: /android(?:\s+)?\{/,
		offset: 1,
		comment: '//',
	});
}

const withTuyaMainApplication: ConfigPlugin<Props> = (config, props) => {
	return withMainApplication(config, (config) => {
    console.log('withTuyaMainApplication', config.modResults.language);
		if (['java'].includes(config.modResults.language)) {
			try {
				config.modResults.contents = addTuyaMainApplicationImport(
					config.modResults.contents
				).contents;
				config.modResults.contents = addTuyaMainApplicationInit(
					config.modResults.contents,
					props
				).contents;
			} catch (error) {
				if ((error as any).code === 'ERR_NO_MATCH') {
					throw new Error(
						'Cannot add Tuya Library to the project\'s MainApplication because it\'s malformed. Please report this with a copy of your project MainApplication.'
					);
				}
				throw error;
			}
		} else {
			throw new Error(
				'Cannot setup Tuya Library because the MainApplication is not Java'
			);
		}
		return config;
	});
};

export function addTuyaMainApplicationImport(src: string): MergeResults {
	return mergeContents({
		tag: 'react-native-tuya-import',
		src,
		newSrc: 'import com.tuya.smart.rnsdk.core.TuyaCoreModule;',
		anchor: /import java\.util\.List;/,
		offset: 1,
		comment: '//',
	});
}

export function addTuyaMainApplicationInit(src: string, props: Props): MergeResults {
	return mergeContents({
		tag: 'react-native-tuya-init',
		src,
		newSrc: [
			'    TuyaCoreModule.Companion.initTuyaSDKWithoutOptions(this);',
		].join('\n'),
		// anchor:
		//   / {2}UIView *rootView = [self.reactDelegate createRootViewWithBridge:bridge moduleName:@"main" initialProperties:nil];/,
		anchor:
      /ApplicationLifecycleDispatcher\.onApplicationCreate\(this\);/,
		offset: 1,
		comment: '//',
	});
}
