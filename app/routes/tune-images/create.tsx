import { json } from '@remix-run/cloudflare';
import { type ActionArgs } from '~/types';

export function action({ request }: ActionArgs) {
	// Create a new tune image
	return json({ id: 'test_id_1' }, { status: 201 });
}
