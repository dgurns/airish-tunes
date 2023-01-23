import { json } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { createDBClient } from '~/db.server';
import type { LoaderArgs } from '~/types';
import { getDaysIntoYear } from '~/utils';

export function headers() {
	return {
		// cache for 1 year as each tune image won't change after it's generated
		'Cache-Control': 'public, max-age=31536000, s-maxage=31536000',
	};
}

export async function loader({ context, params }: LoaderArgs) {
	// get the tune image
	const db = createDBClient(context.DB);
	const tuneImage = await db
		.selectFrom('tune_images')
		.selectAll()
		.where('id', '=', Number(params.id))
		.executeTakeFirst();

	if (!tuneImage) {
		throw new Error('Tune image not found');
	}

	// get the base64 image data
	let base64Data: string | undefined;
	if (tuneImage) {
		const r2Res = await context.R2.get(tuneImage.r2_key);
		base64Data = await r2Res?.text();
	}
	return json({ tuneImage, base64Data }, { status: 200 });
}

export default function TuneImageByID() {
	const { tuneImage, base64Data } = useLoaderData<typeof loader>();

	if (!tuneImage) {
		return null;
	}

	const isToday = tuneImage.days_into_year === getDaysIntoYear(new Date());

	return (
		<>
			<div className="flex flex-row items-center justify-center space-x-4 w-full">
				{isToday && (
					<div className="px-1 py-0.5 text-sm uppercase bg-green-800 text-gray-300 rounded -rotate-12">
						Today
					</div>
				)}
				<h2>{tuneImage?.tune_name ?? 'Generating...'}</h2>
			</div>

			<div className="flex w-full aspect-square bg-black items-center justify-center rounded-xl overflow-hidden">
				<img
					src={`data:image/png;base64,${base64Data}`}
					alt="Tune"
					width="100%"
					height="100%"
				/>
			</div>

			<div className="pt-2 flex flex-col space-y-3 items-center">
				<a
					href={`https://thesession.org/tunes/${tuneImage.the_session_tune_id}`}
					target="_blank"
					rel="noreferrer"
				>
					View this tune on The Session ↗
				</a>
				<Link to="/tune-images">Past days</Link>
			</div>
		</>
	);
}
