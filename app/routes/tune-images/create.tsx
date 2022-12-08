import { json } from '@remix-run/cloudflare';
import { createDBClient } from '~/db.server';
import { type ActionArgs } from '~/types';

// Jan 1 returns 1, Dec 31 returns 365
function daysIntoYear(date: Date) {
	return (
		(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
			Date.UTC(date.getFullYear(), 0, 0)) /
		24 /
		60 /
		60 /
		1000
	);
}

export async function action({ request, context }: ActionArgs) {
	const db = createDBClient(context.DB);

	// TODO: get requested daysIntoYear from request
	const daysIntoYear = 320;

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
	const res = await fetch(
		`https://thesession.org/tunes/popular?format=json&perpage=1&page=${daysIntoYear}`,
		{ method: 'GET' }
	);
	interface TheSessionResponse {
		tunes: Array<{ id: number; name: string }>;
	}
	const resJSON = (await res.json()) as TheSessionResponse;
	const tune = resJSON?.tunes[0];
	if (!tune) {
		throw json(
			{ error: `Could not find tune for Day ${daysIntoYear} on TheSession` },
			{ status: 500 }
		);
	}

	// TODO: create image via OpenAI and save to R2

	// save the tune to the DB with the R2 URL
	const tuneImage = await db
		.insertInto('tune_images')
		.values({
			days_into_year: daysIntoYear,
			tune_name: tune.name,
			the_session_tune_id: tune.id,
			r2_key: 'TODO',
		})
		.returningAll()
		.executeTakeFirstOrThrow();

	return json({ tuneImage }, { status: 201 });
}
