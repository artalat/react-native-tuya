import { ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';

import { withTuyaOnAndroid } from './withTuyaOnAndroid';
import { withTuyaOnIos } from './withTuyaOnIos';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

export type Props = {
  apiKey: string;
  apiSecret: string;
};

const withTuya: ConfigPlugin<Props> = (config, props) => {
	if (!props.apiKey) {
		throw new Error(
			'You must provide an apiKey to use react-native-tuya. See the docs for more info: https://docs.expo.io/versions/latest/sdk/react-native-tuya/',
		);
	}

	if (!props.apiSecret) {
		throw new Error(
			'You must provide an apiSecret to use react-native-tuya. See the docs for more info: https://docs.expo.io/versions/latest/sdk/react-native-tuya/',
		);
	}

	config = withTuyaOnIos(config, props);
	config = withTuyaOnAndroid(config, props);
	return config;
};

export default createRunOncePlugin(withTuya, pkg.name, pkg.version);
