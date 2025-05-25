/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.11-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: db    Database: sustainability_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actions`
--

DROP TABLE IF EXISTS `actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `actions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text NOT NULL,
  `difficulty` enum('low','medium','high') DEFAULT NULL,
  `ods_id` int DEFAULT NULL,
  `specific_objective_id` int NOT NULL,
  `execution_time` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ods_id` (`ods_id`),
  KEY `specific_objective_id` (`specific_objective_id`),
  CONSTRAINT `actions_ibfk_1` FOREIGN KEY (`ods_id`) REFERENCES `ods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `actions_ibfk_2` FOREIGN KEY (`specific_objective_id`) REFERENCES `specific_objectives` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actions`
--

LOCK TABLES `actions` WRITE;
/*!40000 ALTER TABLE `actions` DISABLE KEYS */;
/*!40000 ALTER TABLE `actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alembic_version`
--

LOCK TABLES `alembic_version` WRITE;
/*!40000 ALTER TABLE `alembic_version` DISABLE KEYS */;
INSERT INTO `alembic_version` VALUES
('8e597e8d9c1b');
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessments`
--

DROP TABLE IF EXISTS `assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `score` int NOT NULL,
  `material_topic_id` int NOT NULL,
  `stakeholder_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `material_topic_id` (`material_topic_id`),
  KEY `stakeholder_id` (`stakeholder_id`),
  CONSTRAINT `assessments_ibfk_1` FOREIGN KEY (`material_topic_id`) REFERENCES `material_topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assessments_ibfk_2` FOREIGN KEY (`stakeholder_id`) REFERENCES `stakeholders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnosis_indicators`
--

DROP TABLE IF EXISTS `diagnosis_indicators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnosis_indicators` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `type` enum('quantitative','qualitative') NOT NULL,
  `material_topic_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `material_topic_id` (`material_topic_id`),
  CONSTRAINT `diagnosis_indicators_ibfk_1` FOREIGN KEY (`material_topic_id`) REFERENCES `material_topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnosis_indicators`
--

LOCK TABLES `diagnosis_indicators` WRITE;
/*!40000 ALTER TABLE `diagnosis_indicators` DISABLE KEYS */;
/*!40000 ALTER TABLE `diagnosis_indicators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnosis_indicators_qualitative`
--

DROP TABLE IF EXISTS `diagnosis_indicators_qualitative`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnosis_indicators_qualitative` (
  `diagnostic_indicator_id` int NOT NULL,
  `response` text NOT NULL,
  PRIMARY KEY (`diagnostic_indicator_id`),
  CONSTRAINT `diagnosis_indicators_qualitative_ibfk_1` FOREIGN KEY (`diagnostic_indicator_id`) REFERENCES `diagnosis_indicators` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnosis_indicators_qualitative`
--

LOCK TABLES `diagnosis_indicators_qualitative` WRITE;
/*!40000 ALTER TABLE `diagnosis_indicators_qualitative` DISABLE KEYS */;
/*!40000 ALTER TABLE `diagnosis_indicators_qualitative` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnosis_indicators_quantitative`
--

DROP TABLE IF EXISTS `diagnosis_indicators_quantitative`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnosis_indicators_quantitative` (
  `diagnostic_indicator_id` int NOT NULL,
  `numeric_response` decimal(10,2) NOT NULL,
  `unit` varchar(100) NOT NULL,
  PRIMARY KEY (`diagnostic_indicator_id`),
  CONSTRAINT `diagnosis_indicators_quantitative_ibfk_1` FOREIGN KEY (`diagnostic_indicator_id`) REFERENCES `diagnosis_indicators` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnosis_indicators_quantitative`
--

LOCK TABLES `diagnosis_indicators_quantitative` WRITE;
/*!40000 ALTER TABLE `diagnosis_indicators_quantitative` DISABLE KEYS */;
/*!40000 ALTER TABLE `diagnosis_indicators_quantitative` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dimensions`
--

DROP TABLE IF EXISTS `dimensions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dimensions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dimensions`
--

LOCK TABLES `dimensions` WRITE;
/*!40000 ALTER TABLE `dimensions` DISABLE KEYS */;
/*!40000 ALTER TABLE `dimensions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goals`
--

DROP TABLE IF EXISTS `goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `goals` (
  `ods_id` int NOT NULL,
  `goal_number` varchar(2) NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`ods_id`,`goal_number`),
  CONSTRAINT `goals_ibfk_1` FOREIGN KEY (`ods_id`) REFERENCES `ods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goals`
--

LOCK TABLES `goals` WRITE;
/*!40000 ALTER TABLE `goals` DISABLE KEYS */;
/*!40000 ALTER TABLE `goals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `heritage_resource_social_networks`
--

DROP TABLE IF EXISTS `heritage_resource_social_networks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `heritage_resource_social_networks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resource_id` int DEFAULT NULL,
  `social_network` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `resource_id` (`resource_id`),
  KEY `ix_heritage_resource_social_networks_id` (`id`),
  CONSTRAINT `heritage_resource_social_networks_ibfk_1` FOREIGN KEY (`resource_id`) REFERENCES `heritage_resources` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `heritage_resource_social_networks`
--

LOCK TABLES `heritage_resource_social_networks` WRITE;
/*!40000 ALTER TABLE `heritage_resource_social_networks` DISABLE KEYS */;
/*!40000 ALTER TABLE `heritage_resource_social_networks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `heritage_resource_typologies`
--

DROP TABLE IF EXISTS `heritage_resource_typologies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `heritage_resource_typologies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resource_id` int DEFAULT NULL,
  `typology` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `resource_id` (`resource_id`),
  KEY `ix_heritage_resource_typologies_id` (`id`),
  CONSTRAINT `heritage_resource_typologies_ibfk_1` FOREIGN KEY (`resource_id`) REFERENCES `heritage_resources` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `heritage_resource_typologies`
--

LOCK TABLES `heritage_resource_typologies` WRITE;
/*!40000 ALTER TABLE `heritage_resource_typologies` DISABLE KEYS */;
/*!40000 ALTER TABLE `heritage_resource_typologies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `heritage_resources`
--

DROP TABLE IF EXISTS `heritage_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `heritage_resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `ownership` varchar(255) DEFAULT NULL,
  `management_model` varchar(255) DEFAULT NULL,
  `postal_address` varchar(255) DEFAULT NULL,
  `web_address` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_heritage_resources_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `heritage_resources`
--

LOCK TABLES `heritage_resources` WRITE;
/*!40000 ALTER TABLE `heritage_resources` DISABLE KEYS */;
/*!40000 ALTER TABLE `heritage_resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_topics`
--

DROP TABLE IF EXISTS `material_topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_topics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `priority` enum('high','medium','low') DEFAULT NULL,
  `main_objective` text,
  `goal_ods_id` int DEFAULT NULL,
  `goal_number` varchar(2) DEFAULT NULL,
  `report_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_id` (`report_id`),
  KEY `material_topics_ibfk_1` (`goal_ods_id`,`goal_number`),
  CONSTRAINT `material_topics_ibfk_1` FOREIGN KEY (`goal_ods_id`, `goal_number`) REFERENCES `goals` (`ods_id`, `goal_number`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `material_topics_ibfk_2` FOREIGN KEY (`report_id`) REFERENCES `sustainability_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_topics`
--

LOCK TABLES `material_topics` WRITE;
/*!40000 ALTER TABLE `material_topics` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ods`
--

DROP TABLE IF EXISTS `ods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `dimension_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `dimension_id` (`dimension_id`),
  CONSTRAINT `ods_ibfk_1` FOREIGN KEY (`dimension_id`) REFERENCES `dimensions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ods`
--

LOCK TABLES `ods` WRITE;
/*!40000 ALTER TABLE `ods` DISABLE KEYS */;
/*!40000 ALTER TABLE `ods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_indicators`
--

DROP TABLE IF EXISTS `performance_indicators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `performance_indicators` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `human_resources` text,
  `material_resources` text,
  `type` enum('quantitative','qualitative') NOT NULL,
  `action_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `action_id` (`action_id`),
  CONSTRAINT `performance_indicators_ibfk_1` FOREIGN KEY (`action_id`) REFERENCES `actions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_indicators`
--

LOCK TABLES `performance_indicators` WRITE;
/*!40000 ALTER TABLE `performance_indicators` DISABLE KEYS */;
/*!40000 ALTER TABLE `performance_indicators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_indicators_qualitative`
--

DROP TABLE IF EXISTS `performance_indicators_qualitative`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `performance_indicators_qualitative` (
  `performance_indicator_id` int NOT NULL,
  `response` text NOT NULL,
  PRIMARY KEY (`performance_indicator_id`),
  CONSTRAINT `performance_indicators_qualitative_ibfk_1` FOREIGN KEY (`performance_indicator_id`) REFERENCES `performance_indicators` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_indicators_qualitative`
--

LOCK TABLES `performance_indicators_qualitative` WRITE;
/*!40000 ALTER TABLE `performance_indicators_qualitative` DISABLE KEYS */;
/*!40000 ALTER TABLE `performance_indicators_qualitative` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_indicators_quantitative`
--

DROP TABLE IF EXISTS `performance_indicators_quantitative`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `performance_indicators_quantitative` (
  `performance_indicator_id` int NOT NULL,
  `numeric_response` decimal(10,2) NOT NULL,
  `unit` varchar(100) NOT NULL,
  PRIMARY KEY (`performance_indicator_id`),
  CONSTRAINT `performance_indicators_quantitative_ibfk_1` FOREIGN KEY (`performance_indicator_id`) REFERENCES `performance_indicators` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_indicators_quantitative`
--

LOCK TABLES `performance_indicators_quantitative` WRITE;
/*!40000 ALTER TABLE `performance_indicators_quantitative` DISABLE KEYS */;
/*!40000 ALTER TABLE `performance_indicators_quantitative` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_agreements`
--

DROP TABLE IF EXISTS `report_agreements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_agreements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agreement` text NOT NULL,
  `report_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `report_agreements_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `sustainability_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_agreements`
--

LOCK TABLES `report_agreements` WRITE;
/*!40000 ALTER TABLE `report_agreements` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_agreements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_bibliographies`
--

DROP TABLE IF EXISTS `report_bibliographies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_bibliographies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` text NOT NULL,
  `report_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `report_bibliographies_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `sustainability_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_bibliographies`
--

LOCK TABLES `report_bibliographies` WRITE;
/*!40000 ALTER TABLE `report_bibliographies` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_bibliographies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_logos`
--

DROP TABLE IF EXISTS `report_logos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_logos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `logo` varchar(255) NOT NULL,
  `report_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `report_logos_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `sustainability_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_logos`
--

LOCK TABLES `report_logos` WRITE;
/*!40000 ALTER TABLE `report_logos` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_logos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_norms`
--

DROP TABLE IF EXISTS `report_norms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_norms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `norm` text NOT NULL,
  `report_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `report_norms_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `sustainability_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_norms`
--

LOCK TABLES `report_norms` WRITE;
/*!40000 ALTER TABLE `report_norms` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_norms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_photos`
--

DROP TABLE IF EXISTS `report_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `photo` varchar(255) NOT NULL,
  `report_id` int NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `report_photos_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `sustainability_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_photos`
--

LOCK TABLES `report_photos` WRITE;
/*!40000 ALTER TABLE `report_photos` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `secondary_ods_actions`
--

DROP TABLE IF EXISTS `secondary_ods_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `secondary_ods_actions` (
  `action_id` int NOT NULL,
  `specific_objective_id` int NOT NULL,
  `ods_id` int NOT NULL,
  PRIMARY KEY (`action_id`,`ods_id`),
  KEY `ods_id` (`ods_id`),
  KEY `specific_objective_id` (`specific_objective_id`),
  CONSTRAINT `secondary_ods_actions_ibfk_1` FOREIGN KEY (`action_id`) REFERENCES `actions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `secondary_ods_actions_ibfk_2` FOREIGN KEY (`ods_id`) REFERENCES `ods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `secondary_ods_actions_ibfk_3` FOREIGN KEY (`specific_objective_id`) REFERENCES `specific_objectives` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `secondary_ods_actions`
--

LOCK TABLES `secondary_ods_actions` WRITE;
/*!40000 ALTER TABLE `secondary_ods_actions` DISABLE KEYS */;
/*!40000 ALTER TABLE `secondary_ods_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `secondary_ods_material_topics`
--

DROP TABLE IF EXISTS `secondary_ods_material_topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `secondary_ods_material_topics` (
  `ods_id` int NOT NULL,
  `material_topic_id` int NOT NULL,
  PRIMARY KEY (`ods_id`,`material_topic_id`),
  KEY `material_topic_id` (`material_topic_id`),
  CONSTRAINT `secondary_ods_material_topics_ibfk_1` FOREIGN KEY (`material_topic_id`) REFERENCES `material_topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `secondary_ods_material_topics_ibfk_2` FOREIGN KEY (`ods_id`) REFERENCES `ods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `secondary_ods_material_topics`
--

LOCK TABLES `secondary_ods_material_topics` WRITE;
/*!40000 ALTER TABLE `secondary_ods_material_topics` DISABLE KEYS */;
/*!40000 ALTER TABLE `secondary_ods_material_topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specific_objectives`
--

DROP TABLE IF EXISTS `specific_objectives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `specific_objectives` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text NOT NULL,
  `responsible` varchar(255) DEFAULT NULL,
  `material_topic_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `material_topic_id` (`material_topic_id`),
  CONSTRAINT `specific_objectives_ibfk_1` FOREIGN KEY (`material_topic_id`) REFERENCES `material_topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specific_objectives`
--

LOCK TABLES `specific_objectives` WRITE;
/*!40000 ALTER TABLE `specific_objectives` DISABLE KEYS */;
/*!40000 ALTER TABLE `specific_objectives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stakeholders`
--

DROP TABLE IF EXISTS `stakeholders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `stakeholders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `type` enum('internal','external') NOT NULL,
  `report_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `stakeholders_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `sustainability_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stakeholders`
--

LOCK TABLES `stakeholders` WRITE;
/*!40000 ALTER TABLE `stakeholders` DISABLE KEYS */;
/*!40000 ALTER TABLE `stakeholders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sustainability_reports`
--

DROP TABLE IF EXISTS `sustainability_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sustainability_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `heritage_resource_id` int NOT NULL,
  `year` int NOT NULL,
  `state` enum('Draft','Published') NOT NULL,
  `observation` text NOT NULL,
  `cover_photo` varchar(255) DEFAULT NULL,
  `commitment_letter` text,
  `mission` text,
  `vision` text,
  `values` text,
  `org_chart_text` text,
  `org_chart_figure` varchar(255) DEFAULT NULL,
  `diagnosis_description` text,
  `scale` int NOT NULL,
  `internal_consistency_description` text,
  `main_impact_weight` decimal(5,2) DEFAULT NULL,
  `secondary_impact_weight` decimal(5,2) DEFAULT NULL,
  `roadmap_description` text,
  `data_tables_text` text,
  `permissions` int NOT NULL,
  `survey_state` enum('active','inactive') NOT NULL,
  `materiality_text` text,
  `materiality_matrix_text` text,
  `diffusion_text` text,
  `template` tinyint(1) NOT NULL,
  `main_secondary_impacts_text` text,
  `stakeholders_description` text,
  `published_report` text,
  `action_plan_text` text,
  PRIMARY KEY (`id`),
  KEY `heritage_resource_id` (`heritage_resource_id`),
  CONSTRAINT `sustainability_reports_ibfk_1` FOREIGN KEY (`heritage_resource_id`) REFERENCES `heritage_resources` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sustainability_reports`
--

LOCK TABLES `sustainability_reports` WRITE;
/*!40000 ALTER TABLE `sustainability_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `sustainability_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sustainability_team_members`
--

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `admin` tinyint(1) NOT NULL,
  `name` varchar(100) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiration` datetime DEFAULT NULL,
  `reset_token_state` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'i12gafej@uco.es','$2b$12$hNxsfDKOVPEl16S6dr2DieSYij6Voiv7kPP1uHM9Z9EQEFx8NXRFu',1,'javier','garcia fernandez',NULL,NULL,NULL,0),
(2,'i12usuario@uco.es','$2b$12$N6T99D7MspwPW6f2UUSuIu2zx/Iu8ys1o/5NfwK6QPBpj7IsVVZw6',0,'usuario 2','apellidos','',NULL,NULL,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-24  9:29:03
