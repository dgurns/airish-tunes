import { json } from '@remix-run/cloudflare';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { createDBClient } from '~/db.server';
import type { LoaderArgs } from '~/types';
import { getDaysIntoYear } from '~/utils';

export async function loader({ context }: LoaderArgs) {
	// get today's tune image
	const db = createDBClient(context.DB);
	const tuneImage = await db
		.selectFrom('tune_images')
		.selectAll()
		.where('days_into_year', '=', getDaysIntoYear(new Date()))
		.executeTakeFirst();

	// get the base64 image data
	let base64Data: string | undefined;
	if (tuneImage) {
		const r2Res = await context.R2.get(tuneImage.r2_key);
		base64Data = await r2Res?.text();
	}
	return json({ tuneImage, base64Data }, { status: 200 });
}

export default function Index() {
	const { tuneImage, base64Data } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	// if there isn't yet a tune image for today, generate one
	const [triggeredGeneration, setTriggeredGeneration] = useState(false);
	useEffect(() => {
		if (!tuneImage && !triggeredGeneration) {
			setTriggeredGeneration(true);
			fetcher.submit(null, {
				method: 'post',
				action: '/tune-images/create',
			});
		}
	}, [tuneImage, triggeredGeneration, fetcher]);

	return (
		<div className="flex w-full flex-col items-center">
			<div className="flex w-full flex-col items-center lg:max-w-lg space-y-8 py-8 px-4">
				<div className="flex flex-col items-center text-center">
					<h1>AI-rish Tunes</h1>
					<span className="text-gray-500">
						Every day I pick a random Irish tune and ask an AI to illustrate it.
					</span>
				</div>

				<div className="flex flex-row items-center space-x-4">
					<div className="px-1 py-0.5 text-sm uppercase bg-green-800 text-gray-300 rounded -rotate-12">
						Today
					</div>
					<h2>{tuneImage?.tune_name ?? 'Generating...'}</h2>
				</div>

				<div className="flex w-full aspect-square bg-black items-center justify-center rounded-xl overflow-hidden">
					{!base64Data ? (
						<div className="flex flex-row items-center">
							<div className="animate-spin">↻</div>
							<span className="ml-2">Generating...</span>
						</div>
					) : (
						<img
							src={`data:image/png;base64,${base64Data}`}
							alt="Tune"
							width="100%"
							height="100%"
						/>
					)}
				</div>

				<div className="flex flex-col text-sm space-y-1 text-gray-500 items-center">
					<p>
						Made by <a href="https://dangurney.net">Dan Gurney</a> •{' '}
						<a href="https://github.com/dgurns/airish-tunes">Source Code</a>
					</p>
					<p>
						Tunes from <a href="https://thesession.org">The Session API</a>
					</p>
					<p>
						"AI-rish" pun by <a href="https://chat.openai.com">ChatGPT</a>
					</p>
				</div>
			</div>
		</div>
	);
}
