export interface StoryGroup {
	icon?: string;
	id: string;
	title: string;
}

export const groups: StoryGroup[] = [
	{ id: 'Layouts', title: 'Layouts', icon: 'dashboard' },
	{ id: 'Buttons', title: 'Buttons', icon: 'smart_button' },
	{ id: 'Display', title: 'Display', icon: 'visibility' },
	{ id: 'Feedback', title: 'Feedback', icon: 'notifications' },
];
