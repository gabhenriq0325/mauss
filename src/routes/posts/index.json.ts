import type { RequestHandler } from '@sveltejs/kit';
import type { Post } from '$lib/types';
import { existsSync } from 'fs';
import { join } from 'path';
import { traverse } from 'marqua';
import { fillSiblings } from '$lib/utils/article';

export const get: RequestHandler = async ({ locals: { entry } }) => {
	const posts = traverse<{ entry: string }, Post>(
		entry,
		({ frontMatter, breadcrumb: [filename] }) => {
			if (filename.includes('draft')) return;

			const [published, slug] = filename.split('.');
			const [category] = frontMatter.tags;

			if (!frontMatter.image) {
				const imagePath = `/assets/uploads/${category.toLowerCase()}/thumbnail/${slug}`;
				const rootFolder = `${process.cwd()}/static`;
				for (const ext of ['png', 'jpg']) {
					const image = join(rootFolder, `${imagePath}.${ext}`);
					if (existsSync(image)) frontMatter.image = { en: `${imagePath}.${ext}` };
				}
			}

			const updated = frontMatter.date && frontMatter.date.updated;
			return { slug, ...frontMatter, category, date: { published, updated } };
		}
	);

	return {
		body: fillSiblings(posts.reverse(), 'posts/'),
	};
};
