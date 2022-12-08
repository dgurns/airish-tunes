import { json } from '@remix-run/cloudflare';
import { createDBClient } from '~/db.server';
import { type ActionArgs } from '~/types';
import { getDaysIntoYear } from '~/utils';

export async function action({ context }: ActionArgs) {
	const db = createDBClient(context.DB);
	const daysIntoYear = getDaysIntoYear(new Date());

	// check if we already made a tune image for that day
	const existing = await db
		.selectFrom('tune_images')
		.selectAll()
		.where('days_into_year', '=', daysIntoYear)
		.executeTakeFirst();
	if (existing) {
		return json({ tuneImage: existing }, { status: 200 });
	}

	// if not, look at The Session's most popular tunes and take the corresponding
	// one for that day of the year
	const tuneRes = await fetch(
		`https://thesession.org/tunes/popular?format=json&perpage=1&page=${daysIntoYear}`,
		{ method: 'GET' }
	);
	interface TheSessionResponse {
		tunes: Array<{ id: number; name: string }>;
	}
	const tuneResJSON = (await tuneRes.json()) as TheSessionResponse;
	const tune = tuneResJSON?.tunes[0];
	if (!tune) {
		throw json(
			{ error: `Could not find tune for Day ${daysIntoYear} on TheSession` },
			{ status: 500 }
		);
	}

	// create image via OpenAI
	const imageRes = await fetch('https://api.openai.com/v1/images/generations', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${context.OPENAI_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			prompt: `A beautiful detailed depiction of "${tune.name}"`,
			n: 1,
			size: '512x512',
			response_format: 'b64_json',
		}),
	});
	interface OpenAIResponse {
		data: Array<{ b64_json: string }>;
	}
	const imageResJSON = await imageRes.json<OpenAIResponse>();
	if (!imageResJSON.data) {
		throw new Error('No data received from image generation API');
	}
	const imageBase64 = imageResJSON.data[0].b64_json;

	// save to R2
	const r2Res = await context.R2.put(String(tune.id), imageBase64);

	// save the tune to the DB with the R2 key
	const tuneImage = await db
		.insertInto('tune_images')
		.values({
			days_into_year: daysIntoYear,
			tune_name: tune.name,
			the_session_tune_id: tune.id,
			r2_key: r2Res.key,
		})
		.returningAll()
		.executeTakeFirstOrThrow();

	return json({ tuneImage }, { status: 201 });
}
