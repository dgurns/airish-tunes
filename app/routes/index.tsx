import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { createDBClient } from '~/db.server';
import type { LoaderArgs } from '~/types';

export async function loader({ context }: LoaderArgs) {
	const start = Date.now();
	const db = createDBClient(context.DB);
	const tuneImages = await db.selectFrom('tune_images').selectAll().execute();
	const elapsed = Date.now() - start;
	return json({ tuneImages, elapsed });
}

export default function Index() {
	const { tuneImages, elapsed } = useLoaderData<typeof loader>();

	return (
		<div className="flex flex-col space-y-8">
			<h1>AI-rish Tunes</h1>
			{tuneImages.map((t) => (
				<p key={t.id}>{JSON.stringify(t)}</p>
			))}
			Query latency: {elapsed}ms
		</div>
	);
}
