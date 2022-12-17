import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { createDBClient } from '~/db.server';
import type { LoaderArgs } from '~/types';

export async function loader({ context }: LoaderArgs) {
	// get all tune images
	const db = createDBClient(context.DB);
	const allTuneImages = await db
		.selectFrom('tune_images')
		.selectAll()
		.orderBy('days_into_year', 'desc')
		.execute();
	// filter out duplicate tune names
	const tuneNames: Record<string, true> = {};
	const filteredTuneImages: typeof allTuneImages = [];
	for (const t of allTuneImages) {
		if (!tuneNames[t.tune_name]) {
			filteredTuneImages.push(t);
		}
		tuneNames[t.tune_name] = true;
	}
	return json({ tuneImages: filteredTuneImages }, { status: 200 });
}

export default function TuneImagesIndex() {
	const { tuneImages } = useLoaderData<typeof loader>();

	if (tuneImages.length === 0) {
		return <p className="text-gray-400">No images generated yet</p>;
	}

	return (
		<ul className="flex flex-col items-start list-none w-full space-y-1">
			{tuneImages.map((t) => (
				<li key={t.id}>
					<a href={`/tune-images/${t.id}`}>{t.tune_name}</a>
				</li>
			))}
		</ul>
	);
}
