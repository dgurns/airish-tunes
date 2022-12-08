import {
	type LoaderArgs as RemixLoaderArgs,
	type ActionArgs as RemixActionArgs,
} from '@remix-run/cloudflare';

declare global {
	const DB: D1Database;
}

export default global;

export type Context = {
	DB: D1Database;
	OPENAI_API_KEY: string;
};

export type LoaderArgs = RemixLoaderArgs & {
	context: Context;
};

export type ActionArgs = RemixActionArgs & {
	context: Context;
};
