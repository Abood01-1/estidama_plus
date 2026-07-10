CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(255),
	`color` varchar(7) DEFAULT '#ff007f',
	`requirement` int NOT NULL,
	`type` enum('points','reduction','streak','special') DEFAULT 'points',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carbon_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`transport` int DEFAULT 0,
	`electricity` int DEFAULT 0,
	`water` int DEFAULT 0,
	`food` int DEFAULT 0,
	`waste` int DEFAULT 0,
	`total` int DEFAULT 0,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `carbon_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(100) NOT NULL,
	`description` text,
	`category` enum('transport','electricity','water','food','waste'),
	`targetReduction` int NOT NULL,
	`reward` int NOT NULL DEFAULT 100,
	`startDate` timestamp DEFAULT (now()),
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeId` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_challenge_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` int NOT NULL,
	`completed` int DEFAULT 0,
	`startedAt` timestamp DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `user_challenge_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_points` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`totalPoints` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_points_id` PRIMARY KEY(`id`)
);
