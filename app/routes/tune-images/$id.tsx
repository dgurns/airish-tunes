import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { createDBClient } from '~/db.server';
import type { LoaderArgs } from '~/types';
import { daysIntoYearAsReadableDate } from '~/utils';

export async function loader({ context, params }: LoaderArgs) {
	if (!params.id) {
		return redirect('/');
	}
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

	return (
		<>
			<div className="flex flex-row items-center space-x-4">
				<div className="px-1 py-0.5 text-sm uppercase bg-green-800 text-gray-300 rounded -rotate-12">
					{daysIntoYearAsReadableDate(tuneImage.days_into_year)}
				</div>
				<h2>{tuneImage.tune_name}</h2>
			</div>

			<div className="flex w-full aspect-square bg-black items-center justify-center rounded-xl overflow-hidden">
				<img
					src={`data:image/png;base64,${base64Data}`}
					alt="Tune"
					width="100%"
					height="100%"
				/>
			</div>

			<div className="pt-2">
				<a
					href={`https://thesession.org/tunes/${tuneImage.the_session_tune_id}`}
					target="_blank"
					rel="noreferrer"
				>
					View this tune on The Session ↗
				</a>
			</div>
		</>
	);
}
