import { json } from '@remix-run/cloudflare';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
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

	// if running against a public R2 bucket, use the public URL as src,
	// otherwise fetch the raw base64 image data
	let imageSrc: string | undefined;
	if (tuneImage) {
		if (context.R2_PUBLIC_BASE_URL) {
			imageSrc = `${context.R2_PUBLIC_BASE_URL}/${tuneImage?.the_session_tune_id}`;
		} else {
			const r2Res = await context.R2.get(tuneImage.r2_key);
			const base64Data = await r2Res?.text();
			imageSrc = `data:image/png;base64,${base64Data}`;
		}
	}
	return json({ tuneImage, imageSrc }, { status: 200 });
}

export default function Index() {
	const { tuneImage, imageSrc } = useLoaderData<typeof loader>();
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
		<>
			<div className="flex flex-row items-center justify-center space-x-4 w-full">
				<div className="px-1 py-0.5 text-sm uppercase bg-green-800 text-gray-300 rounded -rotate-12">
					Today
				</div>
				<h2>{tuneImage?.tune_name ?? 'Generating...'}</h2>
			</div>

			<div className="flex w-full aspect-square bg-black items-center justify-center rounded-xl overflow-hidden">
				{!imageSrc ? (
					<div className="flex flex-row items-center">
						<div className="animate-spin">↻</div>
						<span className="ml-2">Generating...</span>
					</div>
				) : (
					<img src={imageSrc} alt="Tune" width="100%" height="100%" />
				)}
			</div>

			{tuneImage && (
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
			)}
		</>
	);
}
