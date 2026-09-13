CREATE TABLE `eco_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`source` varchar(64) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eco_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_challenge_progress` ADD `progress` int NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `user_challenge_progress` ADD `rewardClaimed` int NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `daily_challenges` MODIFY `category` enum('transport','electricity','water','food','waste','carbon','education');
