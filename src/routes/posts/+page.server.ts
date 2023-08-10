import { DATA } from '$lib/content';

export async function load() {
	const content = DATA['posts/'].all();
	const tags = [...new Set(content.flatMap((p) => p.tags))].sort();
	const categories = [...new Set(content.map((p) => p.tags[0]))].sort();
	const sort_by = { updated: 'Last Updated', published: 'Last Published' };
	return {
		list: content,
		unique: { categories, tags, sort_by },
		meta: {
			canonical: 'posts',
			title: 'Posts',
			description: 'Get the latest most recent posts here.',
		},
	};
}
