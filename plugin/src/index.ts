import { ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';

import { withTuyaOnAndroid } from './withTuyaOnAndroid';
import { withTuyaOnIos } from './withTuyaOnIos';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

export type Props = {
  iosApiKey: string;
  iosApiSecret: string;
  androidApiKey: string;
  androidApiSecret: string;
};

const withTuya: ConfigPlugin<Props> = (config, props) => {
	config = withTuyaOnIos(config, props);
	config = withTuyaOnAndroid(config, props);
	return config;
};

export default createRunOncePlugin(withTuya, pkg.name, pkg.version);
