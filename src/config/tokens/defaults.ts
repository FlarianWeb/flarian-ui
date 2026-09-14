import { defaultBackdropConfig } from './backdrop/defaults';
import { defaultControlFontSizeConfig } from './control-font-size/defaults';
import { defaultControlIconSizeConfig } from './control-icon-size/defaults';
import { defaultControlLineHeightConfig } from './control-line-height/defaults';
import { defaultDurationConfig } from './duration/defaults';
import { defaultEasingConfig } from './easing/defaults';
import { defaultFontSizeConfig } from './font-size/defaults';
import { defaultFontWeightConfig } from './font-weight/defaults';
import { defaultRadiusConfig } from './radius/defaults';
import { defaultShadowConfig } from './shadow/defaults';
import { defaultSpaceConfig } from './space/defaults';
import type { DefaultTokensConfig } from './types';

export const defaultTokensConfig = {
	backdrop: defaultBackdropConfig,
	controlFontSize: defaultControlFontSizeConfig,
	controlIconSize: defaultControlIconSizeConfig,
	controlLineHeight: defaultControlLineHeightConfig,
	duration: defaultDurationConfig,
	easing: defaultEasingConfig,
	fontSize: defaultFontSizeConfig,
	fontWeight: defaultFontWeightConfig,
	radius: defaultRadiusConfig,
	shadow: defaultShadowConfig,
	space: defaultSpaceConfig,
} satisfies DefaultTokensConfig;
