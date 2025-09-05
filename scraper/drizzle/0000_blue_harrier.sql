CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile_id` integer NOT NULL,
	`author_name` text,
	`author_tagline` text,
	`author_href` text,
	`date_text` text,
	`body_text` text,
	`body_html` text,
	`likes` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`tagline` text,
	`profile_text` text,
	`profile_raw_html` text,
	`created_at` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL
);
