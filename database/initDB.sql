CREATE DATABASE  IF NOT EXISTS `collab_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `collab_system`;
-- MySQL dump 10.13  Distrib 8.0.40, for macos14 (arm64)
--
-- Host: localhost    Database: collab_system
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,1,'TestDocument01','{\"ops\":[{\"insert\":\"\\t\\t\\t\\t\\t\\t\\t\\t\"},{\"attributes\":{\"italic\":true,\"size\":\"48px\",\"bold\":true},\"insert\":\"TestWriting \"},{\"insert\":\"\\n\\n\"}]}','2025-12-21 13:31:38');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,1,'hi','2025-12-21 13:32:46'),(2,1,1,'im user01','2025-12-21 13:32:48'),(3,1,2,'user02','2025-12-21 13:32:55');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_invitations`
--

DROP TABLE IF EXISTS `project_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_invitations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `inviter_id` int NOT NULL,
  `invitee_email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('editor','viewer') COLLATE utf8mb4_unicode_ci DEFAULT 'editor',
  `status` enum('pending','accepted','declined','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `project_id` (`project_id`),
  KEY `inviter_id` (`inviter_id`),
  CONSTRAINT `project_invitations_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_invitations_ibfk_2` FOREIGN KEY (`inviter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_invitations`
--

LOCK TABLES `project_invitations` WRITE;
/*!40000 ALTER TABLE `project_invitations` DISABLE KEYS */;
INSERT INTO `project_invitations` VALUES (1,1,1,'user02@gmail.com','fd19a5bc7f3d2b4309945fa1ff501d6f922095852c54699de075728a2c75d5eb','editor','accepted','2025-12-21 13:30:10','2025-12-28 13:30:11');
/*!40000 ALTER TABLE `project_invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_members`
--

DROP TABLE IF EXISTS `project_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role` enum('owner','editor','viewer') COLLATE utf8mb4_unicode_ci DEFAULT 'editor',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_project_user` (`project_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `project_members_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_members`
--

LOCK TABLES `project_members` WRITE;
/*!40000 ALTER TABLE `project_members` DISABLE KEYS */;
INSERT INTO `project_members` VALUES (1,1,1,'owner','2025-12-21 11:36:47'),(2,2,1,'owner','2025-12-21 11:37:00'),(3,3,1,'owner','2025-12-21 11:37:22'),(4,4,1,'owner','2025-12-21 11:37:27'),(5,1,2,'editor','2025-12-21 13:30:25');
/*!40000 ALTER TABLE `project_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,1,'TestProject01','Information Technology','2025-12-21 11:36:47'),(2,1,'TestProject02','Computer Science','2025-12-21 11:37:00'),(3,1,'TestProject03','','2025-12-21 11:37:22'),(4,1,'TestProject04','','2025-12-21 11:37:27');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'User01','user01@gmail.com','$2b$10$mdkIrOiIJ1fzs/Vn60Ayme8QIorHnaxkM3A6Su.gIAncFXERdGCGm','2025-12-21 11:34:55'),(2,'User02','user02@gmail.com','$2b$10$ebmlF.jAyYU9.6xzMkpd7OS2.9EKic.6IQGXv1KtPUTzLJLiVV/CW','2025-12-21 11:35:45');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `whiteboards`
--

DROP TABLE IF EXISTS `whiteboards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `whiteboards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` longtext COLLATE utf8mb4_unicode_ci,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `whiteboards_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `whiteboards`
--

LOCK TABLES `whiteboards` WRITE;
/*!40000 ALTER TABLE `whiteboards` DISABLE KEYS */;
INSERT INTO `whiteboards` VALUES (1,1,'TestWhiteboard01','[{\"id\":\"ec05de49-6e97-4bae-84bd-854caadd17aa\",\"color\":\"#000000\",\"size\":5,\"mode\":\"draw\",\"points\":[{\"x\":160,\"y\":25.8125},{\"x\":160,\"y\":25.8125},{\"x\":160,\"y\":26.8125},{\"x\":160,\"y\":28.8125},{\"x\":160,\"y\":32.8125},{\"x\":160,\"y\":36.8125},{\"x\":161,\"y\":39.8125},{\"x\":161,\"y\":43.8125},{\"x\":161,\"y\":47.8125},{\"x\":161,\"y\":50.8125},{\"x\":162,\"y\":53.8125},{\"x\":162,\"y\":56.8125},{\"x\":162,\"y\":58.8125},{\"x\":162,\"y\":59.8125},{\"x\":162,\"y\":60.8125},{\"x\":162,\"y\":61.8125},{\"x\":162,\"y\":61.8125},{\"x\":162,\"y\":61.8125},{\"x\":162,\"y\":62.8125}]},{\"id\":\"2f774289-d7b8-43d3-9a86-829546753950\",\"color\":\"#000000\",\"size\":5,\"mode\":\"draw\",\"points\":[{\"x\":142,\"y\":19.8125},{\"x\":142,\"y\":19.8125},{\"x\":143,\"y\":19.8125},{\"x\":147,\"y\":19.8125},{\"x\":150,\"y\":19.8125},{\"x\":155,\"y\":20.8125},{\"x\":159,\"y\":20.8125},{\"x\":163,\"y\":21.8125},{\"x\":168,\"y\":22.8125},{\"x\":173,\"y\":23.8125},{\"x\":177,\"y\":24.8125},{\"x\":180,\"y\":25.8125},{\"x\":183,\"y\":25.8125},{\"x\":186,\"y\":26.8125},{\"x\":187,\"y\":26.8125},{\"x\":189,\"y\":26.8125},{\"x\":190,\"y\":26.8125},{\"x\":190,\"y\":26.8125},{\"x\":192,\"y\":27.8125},{\"x\":192,\"y\":27.8125},{\"x\":192,\"y\":27.8125},{\"x\":193,\"y\":27.8125},{\"x\":193,\"y\":27.8125},{\"x\":194,\"y\":27.8125},{\"x\":194,\"y\":27.8125},{\"x\":194,\"y\":27.8125},{\"x\":195,\"y\":27.8125}]},{\"id\":\"17430b5b-719b-4fe1-a123-6cdf84b23b74\",\"color\":\"#000000\",\"size\":5,\"mode\":\"draw\",\"points\":[{\"x\":180,\"y\":57.8125},{\"x\":181,\"y\":57.8125},{\"x\":181,\"y\":57.8125},{\"x\":185,\"y\":57.8125},{\"x\":189,\"y\":57.8125},{\"x\":194,\"y\":56.8125},{\"x\":199,\"y\":56.8125},{\"x\":203,\"y\":55.8125},{\"x\":206,\"y\":54.8125},{\"x\":209,\"y\":52.8125},{\"x\":211,\"y\":52.8125},{\"x\":212,\"y\":51.8125},{\"x\":214,\"y\":50.8125},{\"x\":214,\"y\":50.8125},{\"x\":215,\"y\":50.8125},{\"x\":215,\"y\":49.8125},{\"x\":215,\"y\":49.8125},{\"x\":215,\"y\":49.8125},{\"x\":215,\"y\":49.8125},{\"x\":216,\"y\":48.8125},{\"x\":216,\"y\":47.8125},{\"x\":216,\"y\":46.8125},{\"x\":216,\"y\":45.8125},{\"x\":216,\"y\":44.8125},{\"x\":216,\"y\":43.8125},{\"x\":216,\"y\":42.8125},{\"x\":216,\"y\":41.8125},{\"x\":216,\"y\":40.8125},{\"x\":216,\"y\":39.8125},{\"x\":216,\"y\":37.8125},{\"x\":215,\"y\":36.8125},{\"x\":214,\"y\":35.8125},{\"x\":213,\"y\":34.8125},{\"x\":212,\"y\":33.8125},{\"x\":210,\"y\":32.8125},{\"x\":209,\"y\":32.8125},{\"x\":208,\"y\":32.8125},{\"x\":207,\"y\":32.8125},{\"x\":206,\"y\":32.8125},{\"x\":205,\"y\":33.8125},{\"x\":203,\"y\":34.8125},{\"x\":202,\"y\":36.8125},{\"x\":200,\"y\":38.8125},{\"x\":198,\"y\":43.8125},{\"x\":197,\"y\":48.8125},{\"x\":196,\"y\":51.8125},{\"x\":195,\"y\":55.8125},{\"x\":194,\"y\":58.8125},{\"x\":193,\"y\":61.8125},{\"x\":193,\"y\":63.8125},{\"x\":193,\"y\":65.8125},{\"x\":192,\"y\":67.8125},{\"x\":192,\"y\":68.8125},{\"x\":192,\"y\":69.8125},{\"x\":192,\"y\":70.8125},{\"x\":193,\"y\":71.8125},{\"x\":193,\"y\":71.8125},{\"x\":194,\"y\":72.8125},{\"x\":196,\"y\":73.8125},{\"x\":197,\"y\":73.8125},{\"x\":199,\"y\":74.8125},{\"x\":201,\"y\":74.8125},{\"x\":203,\"y\":75.8125},{\"x\":206,\"y\":75.8125},{\"x\":208,\"y\":75.8125},{\"x\":209,\"y\":75.8125},{\"x\":211,\"y\":75.8125},{\"x\":213,\"y\":75.8125},{\"x\":214,\"y\":75.8125},{\"x\":216,\"y\":75.8125},{\"x\":217,\"y\":75.8125},{\"x\":218,\"y\":74.8125},{\"x\":219,\"y\":73.8125},{\"x\":220,\"y\":72.8125},{\"x\":221,\"y\":71.8125},{\"x\":222,\"y\":71.8125},{\"x\":222,\"y\":69.8125},{\"x\":223,\"y\":67.8125},{\"x\":224,\"y\":66.8125},{\"x\":225,\"y\":63.8125},{\"x\":225,\"y\":61.8125},{\"x\":226,\"y\":58.8125},{\"x\":227,\"y\":56.8125},{\"x\":227,\"y\":54.8125},{\"x\":227,\"y\":52.8125},{\"x\":227,\"y\":50.8125},{\"x\":228,\"y\":49.8125},{\"x\":228,\"y\":48.8125},{\"x\":228,\"y\":47.8125},{\"x\":227,\"y\":47.8125},{\"x\":227,\"y\":46.8125},{\"x\":227,\"y\":46.8125},{\"x\":227,\"y\":45.8125},{\"x\":226,\"y\":45.8125},{\"x\":226,\"y\":45.8125},{\"x\":225,\"y\":44.8125},{\"x\":225,\"y\":44.8125},{\"x\":224,\"y\":44.8125},{\"x\":224,\"y\":44.8125},{\"x\":224,\"y\":44.8125},{\"x\":224,\"y\":44.8125},{\"x\":227,\"y\":42.8125},{\"x\":232,\"y\":42.8125},{\"x\":237,\"y\":41.8125},{\"x\":242,\"y\":41.8125},{\"x\":247,\"y\":41.8125},{\"x\":252,\"y\":41.8125},{\"x\":256,\"y\":41.8125},{\"x\":261,\"y\":41.8125},{\"x\":266,\"y\":41.8125},{\"x\":269,\"y\":42.8125},{\"x\":272,\"y\":44.8125},{\"x\":275,\"y\":46.8125},{\"x\":277,\"y\":48.8125},{\"x\":278,\"y\":50.8125},{\"x\":278,\"y\":52.8125},{\"x\":279,\"y\":54.8125},{\"x\":279,\"y\":57.8125},{\"x\":279,\"y\":59.8125},{\"x\":279,\"y\":61.8125},{\"x\":279,\"y\":63.8125},{\"x\":277,\"y\":66.8125},{\"x\":276,\"y\":68.8125},{\"x\":273,\"y\":71.8125},{\"x\":271,\"y\":73.8125},{\"x\":270,\"y\":74.8125},{\"x\":268,\"y\":76.8125},{\"x\":265,\"y\":77.8125},{\"x\":264,\"y\":78.8125},{\"x\":262,\"y\":78.8125},{\"x\":260,\"y\":78.8125},{\"x\":258,\"y\":78.8125},{\"x\":255,\"y\":78.8125},{\"x\":255,\"y\":77.8125},{\"x\":254,\"y\":75.8125},{\"x\":253,\"y\":74.8125},{\"x\":253,\"y\":72.8125},{\"x\":253,\"y\":69.8125},{\"x\":253,\"y\":67.8125},{\"x\":253,\"y\":65.8125},{\"x\":253,\"y\":64.8125},{\"x\":253,\"y\":62.8125},{\"x\":253,\"y\":61.8125}]},{\"id\":\"2a31796e-5589-46d6-8a3b-82a8f5d4eebb\",\"color\":\"#000000\",\"size\":5,\"mode\":\"draw\",\"points\":[{\"x\":300,\"y\":22.8125},{\"x\":300,\"y\":22.8125},{\"x\":300,\"y\":24.8125},{\"x\":300,\"y\":28.8125},{\"x\":301,\"y\":33.8125},{\"x\":302,\"y\":40.8125},{\"x\":303,\"y\":47.8125},{\"x\":304,\"y\":56.8125},{\"x\":305,\"y\":63.8125},{\"x\":305,\"y\":69.8125},{\"x\":306,\"y\":75.8125},{\"x\":307,\"y\":80.8125},{\"x\":307,\"y\":84.8125},{\"x\":307,\"y\":86.8125},{\"x\":307,\"y\":88.8125},{\"x\":307,\"y\":88.8125},{\"x\":308,\"y\":89.8125},{\"x\":308,\"y\":89.8125},{\"x\":308,\"y\":89.8125}]},{\"id\":\"e24962c2-b3e4-46ae-8244-a7735d9cd4a4\",\"color\":\"#000000\",\"size\":5,\"mode\":\"draw\",\"points\":[{\"x\":289,\"y\":54.8125},{\"x\":289,\"y\":54.8125},{\"x\":290,\"y\":54.8125},{\"x\":294,\"y\":54.8125},{\"x\":297,\"y\":54.8125},{\"x\":302,\"y\":54.8125},{\"x\":307,\"y\":54.8125},{\"x\":309,\"y\":54.8125},{\"x\":312,\"y\":54.8125},{\"x\":316,\"y\":54.8125},{\"x\":319,\"y\":54.8125},{\"x\":322,\"y\":54.8125},{\"x\":323,\"y\":54.8125},{\"x\":325,\"y\":54.8125},{\"x\":325,\"y\":54.8125},{\"x\":326,\"y\":54.8125},{\"x\":326,\"y\":54.8125}]},{\"id\":\"5e9bc231-f251-43d1-af77-31eabc091efd\",\"color\":\"#000000\",\"size\":5,\"mode\":\"draw\",\"points\":[{\"x\":387,\"y\":28.8125},{\"x\":387,\"y\":28.8125},{\"x\":386,\"y\":28.8125},{\"x\":384,\"y\":29.8125},{\"x\":382,\"y\":30.8125},{\"x\":379,\"y\":33.8125},{\"x\":375,\"y\":38.8125},{\"x\":371,\"y\":44.8125},{\"x\":368,\"y\":49.8125},{\"x\":365,\"y\":54.8125},{\"x\":363,\"y\":59.8125},{\"x\":361,\"y\":63.8125},{\"x\":359,\"y\":68.8125},{\"x\":358,\"y\":72.8125},{\"x\":358,\"y\":75.8125},{\"x\":358,\"y\":78.8125},{\"x\":357,\"y\":80.8125},{\"x\":357,\"y\":83.8125},{\"x\":358,\"y\":84.8125},{\"x\":359,\"y\":86.8125},{\"x\":361,\"y\":87.8125},{\"x\":364,\"y\":88.8125},{\"x\":366,\"y\":89.8125},{\"x\":369,\"y\":90.8125},{\"x\":373,\"y\":91.8125},{\"x\":378,\"y\":91.8125},{\"x\":383,\"y\":92.8125},{\"x\":388,\"y\":92.8125},{\"x\":393,\"y\":92.8125},{\"x\":396,\"y\":91.8125},{\"x\":400,\"y\":89.8125},{\"x\":403,\"y\":87.8125},{\"x\":406,\"y\":84.8125},{\"x\":409,\"y\":82.8125},{\"x\":411,\"y\":78.8125},{\"x\":414,\"y\":75.8125},{\"x\":415,\"y\":70.8125},{\"x\":417,\"y\":67.8125},{\"x\":417,\"y\":63.8125},{\"x\":418,\"y\":60.8125},{\"x\":418,\"y\":56.8125},{\"x\":418,\"y\":53.8125},{\"x\":418,\"y\":49.8125},{\"x\":417,\"y\":46.8125},{\"x\":416,\"y\":43.8125},{\"x\":415,\"y\":40.8125},{\"x\":413,\"y\":38.8125},{\"x\":410,\"y\":34.8125},{\"x\":407,\"y\":32.8125},{\"x\":405,\"y\":30.8125},{\"x\":403,\"y\":28.8125},{\"x\":401,\"y\":26.8125},{\"x\":399,\"y\":25.8125},{\"x\":398,\"y\":24.8125},{\"x\":397,\"y\":23.8125},{\"x\":396,\"y\":23.8125},{\"x\":396,\"y\":23.8125},{\"x\":396,\"y\":23.8125},{\"x\":396,\"y\":23.8125},{\"x\":395,\"y\":23.8125}]},{\"id\":\"02888386-e823-4b79-a576-a011561d6cdc\",\"color\":\"#000000\",\"size\":5,\"mode\":\"draw\",\"points\":[{\"x\":413,\"y\":41.8125},{\"x\":413,\"y\":41.8125},{\"x\":413,\"y\":39.8125},{\"x\":414,\"y\":35.8125},{\"x\":415,\"y\":30.8125},{\"x\":416,\"y\":24.8125},{\"x\":417,\"y\":19.8125},{\"x\":418,\"y\":11.8125},{\"x\":420,\"y\":4.8125}]},{\"id\":\"e9f69e2d-30a6-44c0-bf37-9b799910e5b6\",\"color\":\"#000000\",\"size\":5,\"mode\":\"draw\",\"points\":[{\"x\":434,\"y\":12.8125},{\"x\":434,\"y\":12.8125},{\"x\":434,\"y\":16.8125},{\"x\":434,\"y\":31.8125},{\"x\":434,\"y\":38.8125},{\"x\":434,\"y\":45.8125},{\"x\":434,\"y\":53.8125},{\"x\":434,\"y\":60.8125},{\"x\":433,\"y\":67.8125},{\"x\":432,\"y\":74.8125},{\"x\":432,\"y\":81.8125},{\"x\":431,\"y\":87.8125},{\"x\":431,\"y\":92.8125},{\"x\":430,\"y\":96.8125},{\"x\":430,\"y\":98.8125},{\"x\":430,\"y\":99.8125},{\"x\":430,\"y\":100.8125},{\"x\":430,\"y\":100.8125},{\"x\":430,\"y\":101.8125},{\"x\":430,\"y\":101.8125}]},{\"id\":\"2df5b58b-d4af-4b23-9bac-ab66c58f662a\",\"color\":\"#000000\",\"size\":5,\"mode\":\"draw\",\"points\":[{\"x\":462,\"y\":53.8125},{\"x\":462,\"y\":53.8125},{\"x\":465,\"y\":53.8125},{\"x\":467,\"y\":54.8125},{\"x\":471,\"y\":55.8125},{\"x\":473,\"y\":56.8125},{\"x\":475,\"y\":57.8125},{\"x\":477,\"y\":58.8125},{\"x\":479,\"y\":59.8125},{\"x\":481,\"y\":60.8125},{\"x\":483,\"y\":61.8125},{\"x\":485,\"y\":62.8125},{\"x\":486,\"y\":62.8125},{\"x\":486,\"y\":63.8125},{\"x\":487,\"y\":64.8125},{\"x\":487,\"y\":64.8125},{\"x\":488,\"y\":65.8125},{\"x\":488,\"y\":65.8125},{\"x\":488,\"y\":66.8125},{\"x\":489,\"y\":66.8125},{\"x\":489,\"y\":66.8125},{\"x\":489,\"y\":66.8125},{\"x\":489,\"y\":67.8125},{\"x\":489,\"y\":67.8125},{\"x\":490,\"y\":67.8125},{\"x\":490,\"y\":67.8125},{\"x\":490,\"y\":67.8125},{\"x\":490,\"y\":67.8125},{\"x\":490,\"y\":67.8125},{\"x\":491,\"y\":67.8125},{\"x\":491,\"y\":67.8125},{\"x\":491,\"y\":68.8125},{\"x\":492,\"y\":68.8125},{\"x\":493,\"y\":68.8125},{\"x\":493,\"y\":68.8125},{\"x\":494,\"y\":68.8125},{\"x\":495,\"y\":68.8125},{\"x\":496,\"y\":68.8125},{\"x\":497,\"y\":68.8125},{\"x\":498,\"y\":68.8125}]}]','2025-12-21 13:32:26');
/*!40000 ALTER TABLE `whiteboards` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-21 20:35:26
