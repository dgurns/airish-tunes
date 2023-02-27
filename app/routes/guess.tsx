import { json } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { sql } from 'kysely';
import { useState } from 'react';
import { createDBClient } from '~/db.server';
import type { LoaderArgs } from '~/types';
import { getDaysIntoYear } from '~/utils';

export async function loader({ context, params }: LoaderArgs) {
	// get a random tune image
	const db = createDBClient(context.DB);
	const tuneImage = await db
		.selectFrom('tune_images')
		.selectAll()
		.orderBy(sql`RANDOM()`)
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

export default function Guess() {
	const { tuneImage, base64Data } = useLoaderData<typeof loader>();

	const [revealName, setRevealName] = useState(false);

	if (!tuneImage) {
		return null;
	}

	return (
		<>
			<div className="flex flex-row items-center justify-center space-x-4 w-full">
				{!revealName ? (
					<form
						onSubmit={(e) => e.preventDefault()}
						className="flex flex-row space-x-2"
					>
						<input
							type="text"
							placeholder="Guess the tune"
							className="px-2 py-1 rounded text-black placeholder:text-gray-400"
						/>
						<button type="submit" onClick={() => setRevealName(true)}>
							Reveal
						</button>
					</form>
				) : (
					<div className="flex flex-col space-y-2 text-center">
						<h2>{tuneImage.tune_name}</h2>
						<a href="/guess">Play again</a>
					</div>
				)}
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
