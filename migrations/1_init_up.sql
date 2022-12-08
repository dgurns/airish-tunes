CREATE TABLE tune_images (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	days_into_year INTEGER NOT NULL,
	tune_name TEXT NOT NULL,
	the_session_tune_id INTEGER NOT NULL,
	r2_key TEXT,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);