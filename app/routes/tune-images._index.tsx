import { defer } from '@remix-run/cloudflare';
import { useLoaderData, Await } from '@remix-run/react';
import { Suspense } from 'react';
import { createDBClient } from '~/db.server';
import type { LoaderArgs } from '~/types';

export function headers() {
	return {
		// cache for 1 hour
		'Cache-Control': 'public, max-age=3600, s-maxage=3600',
	};
}

export async function loader({ context }: LoaderArgs) {
	// get all tune images
	const db = createDBClient(context.DB);
	const tuneImagesPromise = db
		.selectFrom('tune_images')
		.selectAll()
		.groupBy('tune_name')
		.orderBy('days_into_year', 'desc')
		.execute();
	return defer({ tuneImagesPromise }, { status: 200 });
}

export default function TuneImagesIndex() {
	const { tuneImagesPromise } = useLoaderData<typeof loader>();

	return (
		<Suspense
			fallback={
				<p className="text-gray-400 flex flex-col items-start w-full">
					Loading...
				</p>
			}
		>
			<Await resolve={tuneImagesPromise}>
				{(tuneImages) =>
					tuneImages.length === 0 ? (
						<p className="text-gray-400">No images generated yet</p>
					) : (
						<ul className="flex flex-col items-start list-none w-full space-y-1">
							{tuneImages.map((t) => (
								<li key={t.id}>
									<a href={`/tune-images/${t.id}`}>{t.tune_name}</a>
								</li>
							))}
						</ul>
					)
				}
			</Await>
		</Suspense>
	);
}
