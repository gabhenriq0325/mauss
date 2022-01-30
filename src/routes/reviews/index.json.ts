import type { RequestHandler } from '@sveltejs/kit';
import type { Locals, Review } from '$lib/utils/types';
import { countAverageRating, fillSiblings } from '$lib/utils/article';
import { traverse, forge } from 'marqua';
import { tryNumber } from 'mauss/utils';
import { compare } from 'mauss';

export const get: RequestHandler<Locals> = async ({ locals: { entry } }) => {
	const config = forge.traverse({
		entry,
		recurse: true,
		sort(x: Review, y: Review) {
			const xd = x.date.updated || x.date.published;
			const yd = y.date.updated || y.date.published;
			return compare.date(xd, yd);
		},
	});
	const reviews = traverse<typeof config, Review>(
		config,
		({ frontMatter, breadcrumb: [filename, folder] }) => {
			if (filename.includes('draft') || frontMatter.draft) return;
			if (typeof frontMatter.seen.first !== 'string') {
				frontMatter.seen.first = frontMatter.seen.first[0];
			}
			return {
				slug: `${folder}/${filename.split('.')[0]}`,
				category: folder,
				...frontMatter,
				rating: countAverageRating(frontMatter.rating),
				verdict: tryNumber(frontMatter.verdict || -2),
			};
		}
	);

	return {
		body: fillSiblings(reviews, 'reviews/', ({ rating, verdict }) => !rating || verdict < -1),
	};
};
