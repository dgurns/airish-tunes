import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { createDBClient } from '~/db.server';
import type { LoaderArgs } from '~/types';

export async function loader({ context }: LoaderArgs) {
	const db = createDBClient(context.DB);
	const today = new Date().toISOString().split('T')[0];
	const tuneImage = await db
		.selectFrom('tune_images')
		.selectAll()
		.where('date', '=', today)
		.executeTakeFirst();
	return json({ tuneImage }, { status: 200 });
}

export default function Index() {
	const { tuneImage } = useLoaderData<typeof loader>();
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
					<h2>The Maid Behind the Bar</h2>
				</div>

				<div className="flex w-full aspect-square bg-black items-center justify-center rounded-xl">
					{!tuneImage ? (
						<div className="flex flex-row items-center">
							<div className="animate-spin">↻</div>
							<span className="ml-2">Generating...</span>
						</div>
					) : (
						<img
							src="https://dangurney.net/images/DanGurneyPhotoCircle.png"
							alt="Tune"
							width="100%"
							height="100%"
						/>
					)}
				</div>

				<div className="flex flex-col text-sm space-y-1 text-gray-500 items-center">
					<p>
						Made by <a href="https://dangurney.net">Dan Gurney</a>
					</p>
					<p>
						<a href="https://github.com/dgurns/airish-tunes">Source Code</a>
					</p>
					<p>
						Tunes from <a href="https://thesession.org">The Session API</a>
					</p>
				</div>
			</div>
		</div>
	);
}
