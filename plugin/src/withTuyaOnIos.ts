import { ConfigPlugin, withAppDelegate, withEntitlementsPlist, withInfoPlist } from '@expo/config-plugins';
import { mergeContents, MergeResults } from '@expo/config-plugins/build/utils/generateCode';

import { Props } from './';

/**
 * Apply react-native-tuya configuration for Expo SDK 44 projects.
 */
export const withTuyaOnIos: ConfigPlugin<Props> = (
	config,
	props
) => {
	if (!props.iosApiKey) {
		throw new Error(
			// eslint-disable-next-line max-len
			'You must provide an iosApiKey to use react-native-tuya. See the docs for more info: https://docs.expo.io/versions/latest/sdk/react-native-tuya/',
		);
	}

	if (!props.iosApiSecret) {
		throw new Error(
			// eslint-disable-next-line max-len
			'You must provide an iosApiSecret to use react-native-tuya. See the docs for more info: https://docs.expo.io/versions/latest/sdk/react-native-tuya/',
		);
	}

	withTuyaAppDelegate(config, props);
	withTuyaEntitlements(config);

	// return withReactNativeTuyaInfoPlist(config, props);

	return config;
};

const withReactNativeTuyaInfoPlist: ConfigPlugin<Props> = (
	config,
	activityTypes
) => {
	return withInfoPlist(config, (config) => {
		config.modResults.NSUserActivityTypes = activityTypes;
		return config;
	});
};

export function addTuyaAppDelegateImport(src: string): MergeResults {
	return mergeContents({
		tag: 'react-native-tuya',
		src,
		newSrc: '#import <TuyaSmartHomeKit/TuyaSmartKit.h>',
		anchor: /#import "AppDelegate\.h"/,
		offset: 1,
		comment: '//',
	});
}

export function addTuyaAppDelegateInit(src: string, props: Props): MergeResults {
	return mergeContents({
		tag: 'react-native-tuya-delegate',
		src,
		newSrc: [
			'	#ifdef DEBUG',
			'    [[TuyaSmartSDK sharedInstance] setDebugMode:YES];',
			'  #endif',
			'',
			// eslint-disable-next-line max-len
			`  [[TuyaSmartSDK sharedInstance] startWithAppKey:@"${props.iosApiKey}" secretKey:@"${props.iosApiSecret}"];`,
		].join('\n'),
		// anchor:
		// eslint-disable-next-line max-len
		//   / {2}UIView *rootView = [self.reactDelegate createRootViewWithBridge:bridge moduleName:@"main" initialProperties:nil];/,
		anchor:
      /self.moduleName = @"main";/,
		offset: 1,
		comment: '//',
	});
}

/** Append the Tuya entitlement on iOS */
const withTuyaEntitlements: ConfigPlugin = (config) => {
	return withEntitlementsPlist(config, (config) => {
		config.modResults['com.apple.developer.networking.multicast'] = true;
		return config;
	});
};

const withTuyaAppDelegate: ConfigPlugin<Props> = (config, props) => {
	return withAppDelegate(config, (config) => {
		if (['objc', 'objcpp'].includes(config.modResults.language)) {
			try {
				config.modResults.contents = addTuyaAppDelegateImport(
					config.modResults.contents
				).contents;
				config.modResults.contents = addTuyaAppDelegateInit(
					config.modResults.contents,
					props
				).contents;
			} catch (error) {
				if ((error as any).code === 'ERR_NO_MATCH') {
					throw new Error(
						// eslint-disable-next-line max-len
						'Cannot add Tuya Library to the project\'s AppDelegate because it\'s malformed. Please report this with a copy of your project AppDelegate.'
					);
				}
				throw error;
			}
		} else {
			throw new Error(
				'Cannot setup Tuya Library because the AppDelegate is not Objective C'
			);
		}
		return config;
	});
};
