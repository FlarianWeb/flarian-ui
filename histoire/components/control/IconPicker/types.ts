import type { UiIcon } from '@flarian/ui';

export type IconPickerModel = UiIcon | undefined;

export type IconPickerProps = {
	modelValue: IconPickerModel;
	options: readonly UiIcon[];
};
