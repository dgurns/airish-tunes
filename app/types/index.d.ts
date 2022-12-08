import {
	type LoaderArgs as RemixLoaderArgs,
	type ActionArgs as RemixActionArgs,
} from '@remix-run/cloudflare';

declare global {
	const DB: D1Database;
	const R2: R2Bucket;
}

export default global;

export type Context = {
	DB: D1Database;
	R2: R2Bucket;
	OPENAI_API_KEY: string;
};

export type LoaderArgs = RemixLoaderArgs & {
	context: Context;
};

export type ActionArgs = RemixActionArgs & {
	context: Context;
};
