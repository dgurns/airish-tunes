import { type ColumnType, Kysely, type Generated } from 'kysely';
import { D1Dialect } from 'kysely-d1';

interface TuneImagesTable {
	id: Generated<number>;
	date: string;
	tune_name: string;
	the_session_tune_id: string;
	r2_key: string | null;
	created_at: ColumnType<Date, never, never>;
	updated_at: ColumnType<Date, never, Date>;
}

interface Database {
	tune_images: TuneImagesTable;
}

export function createDBClient(d1Binding: D1Database) {
	return new Kysely<Database>({
		dialect: new D1Dialect({ database: d1Binding }),
	});
}