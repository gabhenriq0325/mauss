import { curated, posts, quotes, reviews } from '$lib/content';
import { compare } from 'mauss';

export const load: import('./$types').PageServerLoad = async () => {
	const content = [quotes.all(), curated.all(), posts.all(), reviews.all()] as const;

	return {
		quotes: content[0].slice(0, content[0].length / 2),
		curated: content[1]
			.sort((x: any, y: any) => compare.date(x.date.updated, y.date.updated))
			.slice(0, 4),
		posts: content[2].slice(0, 4),
		reviews: content[3].filter((x) => x.rating && x.verdict !== 'pending').slice(0, 4),
	};
};