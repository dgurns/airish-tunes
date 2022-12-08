import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { createDBClient } from '~/db.server';
import type { LoaderArgs } from '~/types';

export async function loader({ context }: LoaderArgs) {
	const db = createDBClient(context.DB);
	const tuneImages = await db.selectFrom('tune_images').selectAll().execute();
	return json({ tuneImages });
}

export default function Index() {
	const { tuneImages } = useLoaderData<typeof loader>();
	return (
		<div className="flex flex-col space-y-8">
			<h1>AI-rish Tunes</h1>
			{tuneImages.map((t) => (
				<p key={t.id}>{JSON.stringify(t)}</p>
			))}
		</div>
	);
}
