-- MySQL dump 10.13  Distrib 9.2.0, for Linux (x86_64)
--
-- Host: localhost    Database: sustainability_db
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
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
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text NOT NULL,
  `difficulty` enum('low','medium','high') DEFAULT NULL,
  `ods_id` int DEFAULT NULL,
  `specific_objective_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ods_id` (`ods_id`),
  KEY `specific_objective_id` (`specific_objective_id`),
  CONSTRAINT `actions_ibfk_1` FOREIGN KEY (`ods_id`) REFERENCES `ods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `actions_ibfk_2` FOREIGN KEY (`specific_objective_id`) REFERENCES `specific_objectives` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actions`
--

LOCK TABLES `actions` WRITE;
/*!40000 ALTER TABLE `actions` DISABLE KEYS */;
INSERT INTO `actions` VALUES (1,'Acción 1','medium',4,1),(2,'Acción 2','medium',9,1),(3,'Acción 3','high',11,1),(4,'Acción 4','low',NULL,1),(5,'asdasddd','high',3,7),(6,'ggggg','high',11,7),(7,'sdgs','low',9,8),(8,'bbbbb','low',17,8);
/*!40000 ALTER TABLE `actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
INSERT INTO `alembic_version` VALUES ('9ae5df08e447');
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessments`
--

DROP TABLE IF EXISTS `assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES (21,3,1,2),(22,4,2,2),(23,5,3,2),(24,5,4,2),(25,5,5,2),(26,5,6,2),(27,5,7,2),(28,2,8,2),(29,2,9,2),(30,3,10,2),(31,4,11,2),(32,5,12,2),(33,1,13,2),(34,2,14,2),(35,3,15,2),(36,4,16,2),(37,5,17,2),(38,3,18,2),(39,4,19,2),(40,1,20,2),(41,3,1,4),(42,2,2,4),(43,1,3,4),(44,5,4,4),(45,3,5,4),(46,2,6,4),(47,5,7,4),(48,2,8,4),(49,5,9,4),(50,2,10,4),(51,5,11,4),(52,2,12,4),(53,5,13,4),(54,2,14,4),(55,5,15,4),(56,2,16,4),(57,5,17,4),(58,5,18,4),(59,5,19,4),(60,5,20,4);
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnostic_indicators`
--

DROP TABLE IF EXISTS `diagnostic_indicators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnostic_indicators` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('quantitative','qualitative') NOT NULL,
  `material_topic_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `material_topic_id` (`material_topic_id`),
  CONSTRAINT `diagnostic_indicators_ibfk_1` FOREIGN KEY (`material_topic_id`) REFERENCES `material_topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnostic_indicators`
--

LOCK TABLES `diagnostic_indicators` WRITE;
/*!40000 ALTER TABLE `diagnostic_indicators` DISABLE KEYS */;
INSERT INTO `diagnostic_indicators` VALUES (2,'Hola','qualitative',1),(3,'Hola2','quantitative',2);
/*!40000 ALTER TABLE `diagnostic_indicators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnostic_indicators_qualitative`
--

DROP TABLE IF EXISTS `diagnostic_indicators_qualitative`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnostic_indicators_qualitative` (
  `diagnostic_indicator_id` int NOT NULL,
  `response` text NOT NULL,
  PRIMARY KEY (`diagnostic_indicator_id`),
  CONSTRAINT `diagnostic_indicators_qualitative_ibfk_1` FOREIGN KEY (`diagnostic_indicator_id`) REFERENCES `diagnostic_indicators` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnostic_indicators_qualitative`
--

LOCK TABLES `diagnostic_indicators_qualitative` WRITE;
/*!40000 ALTER TABLE `diagnostic_indicators_qualitative` DISABLE KEYS */;
INSERT INTO `diagnostic_indicators_qualitative` VALUES (2,'ss');
/*!40000 ALTER TABLE `diagnostic_indicators_qualitative` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnostic_indicators_quantitative`
--

DROP TABLE IF EXISTS `diagnostic_indicators_quantitative`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnostic_indicators_quantitative` (
  `diagnostic_indicator_id` int NOT NULL,
  `numeric_response` decimal(10,2) NOT NULL,
  `unit` varchar(100) NOT NULL,
  PRIMARY KEY (`diagnostic_indicator_id`),
  CONSTRAINT `diagnostic_indicators_quantitative_ibfk_1` FOREIGN KEY (`diagnostic_indicator_id`) REFERENCES `diagnostic_indicators` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnostic_indicators_quantitative`
--

LOCK TABLES `diagnostic_indicators_quantitative` WRITE;
/*!40000 ALTER TABLE `diagnostic_indicators_quantitative` DISABLE KEYS */;
INSERT INTO `diagnostic_indicators_quantitative` VALUES (3,3.00,'23423');
/*!40000 ALTER TABLE `diagnostic_indicators_quantitative` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dimensions`
--

DROP TABLE IF EXISTS `dimensions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dimensions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dimensions`
--

LOCK TABLES `dimensions` WRITE;
/*!40000 ALTER TABLE `dimensions` DISABLE KEYS */;
INSERT INTO `dimensions` VALUES (3,'Personas','Poner fin a la pobreza y el hambre en todas sus formas y asegurar la dignidad e igualdad de todas las personas.'),(4,'Planeta','La Agenda 2030 pretende proteger los recursos naturales del planeta y combatir el cambio climático para asegurar un ambiente digno para las futuras generaciones'),(5,'Prosperidad','Asegurar que todos puedan disfrutar de una vida próspera y plena en armonía con la naturaleza. Aquí quedarían englobados.'),(6,'Paz','Fomentar sociedades pacíficas, justas e inclusivas es esencial para la Agenda 2030'),(7,'Alianzas','Implementar la Agenda 2030 a través de alianzas globales sólidas.');
/*!40000 ALTER TABLE `dimensions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goals`
--

DROP TABLE IF EXISTS `goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
INSERT INTO `goals` VALUES (1,'1','Para 2030, erradicar la pobreza extrema para todas las personas en el mundo...'),(1,'2','Para 2030, reducir al menos a la mitad la proporción de hombres, mujeres y niños y niñas...'),(1,'3','Poner en práctica a nivel nacional sistemas y medidas apropiadas de protección social...'),(1,'4','Para 2030, garantizar que todos los hombres y mujeres, en particular los pobres...'),(1,'5','Para 2030, fomentar la resiliencia de los pobres y las personas en situaciones vulnerables...'),(1,'a','Garantizar una movilización importante de recursos procedentes de diversas fuentes...'),(1,'b','Crear marcos normativos sólidos en el ámbito nacional, regional e internacional...'),(2,'1','Para 2030, poner fin al hambre y asegurar el acceso de todas las personas...'),(2,'2','Para 2030, poner fin a todas las formas de malnutrición...'),(2,'3','Para 2030, duplicar la productividad agrícola y los ingresos de los productores de alimentos...'),(2,'4','Para 2030, asegurar la sostenibilidad de los sistemas de producción de alimentos...'),(2,'5','Para 2020, mantener la diversidad genética de las semillas, las plantas cultivadas...'),(2,'a','Aumentar las inversiones, incluso mediante una mayor cooperación internacional...'),(2,'b','Corregir y prevenir las restricciones y distorsiones comerciales...'),(2,'c','Adoptar medidas para asegurar el buen funcionamiento de los mercados de productos...'),(3,'1','Para 2030, reducir la tasa mundial de mortalidad materna a menos de 70 por cada 100.000 nacidos vivos'),(3,'2','Para 2030, poner fin a las muertes evitables de recién nacidos y de niños menores de 5 años...'),(3,'3','Para 2030, poner fin a las epidemias del SIDA, la tuberculosis, la malaria...'),(3,'4','Para 2030, reducir en un tercio la mortalidad prematura por enfermedades no transmisibles...'),(3,'5','Fortalecer la prevención y el tratamiento del abuso de sustancias adictivas...'),(3,'6','Para 2020, reducir a la mitad el número de muertes y lesiones causadas por accidentes de tráfico...'),(3,'7','Para 2030, garantizar el acceso universal a los servicios de salud sexual y reproductiva...'),(3,'8','Lograr la cobertura sanitaria universal, en particular la protección contra los riesgos financieros...'),(3,'9','Para 2030, reducir sustancialmente el número de muertes y enfermedades producidas por productos químicos...'),(3,'a','Fortalecer la aplicación del Convenio Marco de la OMS para el Control del Tabaco...'),(3,'b','Apoyar las actividades de investigación y desarrollo de vacunas y medicamentos...'),(3,'c','Aumentar sustancialmente la financiación de la salud y la contratación del personal sanitario...'),(3,'d','Reforzar la capacidad de todos los países en materia de alerta temprana y gestión de riesgos para la salud'),(4,'1','De aquí a 2030, asegurar que todas las niñas y todos los niños terminen la enseñanza primaria y secundaria...'),(4,'2','De aquí a 2030, asegurar que todas las niñas y todos los niños tengan acceso a servicios de atención en la primera infancia...'),(4,'3','De aquí a 2030, asegurar el acceso igualitario de todos los hombres y las mujeres a una formación técnica y superior...'),(4,'4','De aquí a 2030, aumentar considerablemente el número de jóvenes y adultos que tienen competencias necesarias...'),(4,'5','De aquí a 2030, eliminar las disparidades de género en la educación y asegurar el acceso igualitario...'),(4,'6','De aquí a 2030, asegurar que todos los jóvenes y una proporción considerable de los adultos estén alfabetizados...'),(4,'7','De aquí a 2030, asegurar que todos los alumnos adquieran los conocimientos necesarios para promover el desarrollo sostenible...'),(4,'a','Construir y adecuar instalaciones educativas que tengan en cuenta las necesidades de los niños y personas con discapacidad...'),(4,'b','De aquí a 2020, aumentar considerablemente a nivel mundial el número de becas disponibles para países en desarrollo...'),(4,'c','De aquí a 2030, aumentar considerablemente la oferta de docentes calificados...'),(5,'1','Poner fin a todas las formas de discriminación contra todas las mujeres y las niñas en todo el mundo'),(5,'2','Eliminar todas las formas de violencia contra todas las mujeres y las niñas en los ámbitos público y privado...'),(5,'3','Eliminar todas las prácticas nocivas, como el matrimonio infantil, precoz y forzado y la mutilación genital femenina'),(5,'4','Reconocer y valorar los cuidados y el trabajo doméstico no remunerados mediante servicios públicos...'),(5,'5','Asegurar la participación plena y efectiva de las mujeres y la igualdad de oportunidades de liderazgo...'),(5,'6','Asegurar el acceso universal a la salud sexual y reproductiva y los derechos reproductivos...'),(5,'a','Emprender reformas que otorguen a las mujeres igualdad de derechos a los recursos económicos...'),(5,'b','Mejorar el uso de la tecnología instrumental, en particular la tecnología de la información...'),(5,'c','Aprobar y fortalecer políticas acertadas y leyes aplicables para promover la igualdad de género...'),(6,'1','De aquí a 2030, lograr el acceso universal y equitativo al agua potable a un precio asequible para todos'),(6,'2','De aquí a 2030, lograr el acceso a servicios de saneamiento e higiene adecuados y equitativos para todos...'),(6,'3','De aquí a 2030, mejorar la calidad del agua reduciendo la contaminación...'),(6,'4','De aquí a 2030, aumentar considerablemente el uso eficiente de los recursos hídricos...'),(6,'5','De aquí a 2030, implementar la gestión integrada de los recursos hídricos a todos los niveles...'),(6,'6','De aquí a 2020, proteger y restablecer los ecosistemas relacionados con el agua...'),(6,'a','De aquí a 2030, ampliar la cooperación internacional y el apoyo prestado a los países en desarrollo...'),(6,'b','Apoyar y fortalecer la participación de las comunidades locales en la mejora de la gestión del agua...'),(7,'1','De aquí a 2030, garantizar el acceso universal a servicios energéticos asequibles, fiables y modernos'),(7,'2','De aquí a 2030, aumentar considerablemente la proporción de energía renovable en el conjunto de fuentes energéticas'),(7,'3','De aquí a 2030, duplicar la tasa mundial de mejora de la eficiencia energética'),(7,'a','De aquí a 2030, aumentar la cooperación internacional para facilitar el acceso a la investigación y la tecnología relativas a la energía limpia...'),(7,'b','De aquí a 2030, ampliar la infraestructura y mejorar la tecnología para prestar servicios energéticos modernos y sostenibles...'),(8,'1','Mantener el crecimiento económico per capita de conformidad con las circunstancias nacionales...'),(8,'10','Fortalecer la capacidad de las instituciones financieras nacionales para fomentar y ampliar el acceso a los servicios bancarios...'),(8,'2','Lograr niveles más elevados de productividad económica mediante la diversificación, la modernización tecnológica y la innovación...'),(8,'3','Promover políticas orientadas al desarrollo que apoyen las actividades productivas...'),(8,'4','Mejorar progresivamente, de aquí a 2030, la producción y el consumo eficientes de los recursos mundiales...'),(8,'5','De aquí a 2030, lograr el empleo pleno y productivo y el trabajo decente para todas las mujeres y los hombres...'),(8,'6','De aquí a 2020, reducir considerablemente la proporción de jóvenes que no están empleados y no cursan estudios...'),(8,'7','Adoptar medidas inmediatas y eficaces para erradicar el trabajo forzoso...'),(8,'8','Proteger los derechos laborales y promover un entorno de trabajo seguro y sin riesgos...'),(8,'9','De aquí a 2030, elaborar y poner en práctica políticas encaminadas a promover un turismo sostenible...'),(8,'a','Aumentar el apoyo a la iniciativa de ayuda para el comercio en los países en desarrollo...'),(8,'b','De aquí a 2020, desarrollar y poner en marcha una estrategia mundial para el empleo de los jóvenes...'),(9,'1','Desarrollar infraestructuras fiables, sostenibles, resilientes y de calidad...'),(9,'2','Promover una industrialización inclusiva y sostenible y, de aquí a 2030, aumentar significativamente la contribución de la industria...'),(9,'3','Aumentar el acceso de las pequeñas industrias y otras empresas a los servicios financieros...'),(9,'4','De aquí a 2030, modernizar la infraestructura y reconvertir las industrias para que sean sostenibles...'),(9,'5','Aumentar la investigación científica y mejorar la capacidad tecnológica de los sectores industriales...'),(9,'a','Facilitar el desarrollo de infraestructuras sostenibles y resilientes en los países en desarrollo...'),(9,'b','Apoyar el desarrollo de tecnologías, la investigación y la innovación nacionales en los países en desarrollo...'),(9,'c','Aumentar significativamente el acceso a la tecnología de la información y las comunicaciones...'),(10,'1','De aquí a 2030, lograr progresivamente y mantener el crecimiento de los ingresos del 40% más pobre...'),(10,'2','De aquí a 2030, potenciar y promover la inclusión social, económica y política de todas las personas...'),(10,'3','Garantizar la igualdad de oportunidades y reducir la desigualdad de resultados...'),(10,'4','Adoptar políticas, especialmente fiscales, salariales y de protección social...'),(10,'5','Mejorar la reglamentación y vigilancia de las instituciones y los mercados financieros mundiales...'),(10,'6','Asegurar una mayor representación e intervención de los países en desarrollo...'),(10,'7','Facilitar la migración y la movilidad ordenadas, seguras, regulares y responsables de las personas...'),(10,'a','Aplicar el principio del trato especial y diferenciado para los países en desarrollo...'),(10,'b','Fomentar la asistencia oficial para el desarrollo y las corrientes financieras...'),(10,'c','De aquí a 2030, reducir a menos del 3% los costos de transacción de las remesas de los migrantes...'),(11,'1','De aquí a 2030, asegurar el acceso de todas las personas a viviendas y servicios básicos adecuados...'),(11,'2','De aquí a 2030, proporcionar acceso a sistemas de transporte seguros, asequibles, accesibles y sostenibles...'),(11,'3','De aquí a 2030, aumentar la urbanización inclusiva y sostenible...'),(11,'4','Redoblar los esfuerzos para proteger y salvaguardar el patrimonio cultural y natural del mundo'),(11,'5','De aquí a 2030, reducir significativamente el número de muertes causadas por los desastres...'),(11,'6','De aquí a 2030, reducir el impacto ambiental negativo per capita de las ciudades...'),(11,'7','De aquí a 2030, proporcionar acceso universal a zonas verdes y espacios públicos seguros...'),(11,'a','Apoyar los vínculos económicos, sociales y ambientales positivos entre las zonas urbanas y rurales...'),(11,'b','De aquí a 2020, aumentar considerablemente el número de ciudades y asentamientos humanos que adoptan políticas de resiliencia...'),(11,'c','Proporcionar apoyo a los países menos adelantados para construir edificios sostenibles y resilientes...'),(12,'1','Aplicar el Marco Decenal de Programas sobre Modalidades de Consumo y Producción Sostenibles...'),(12,'2','De aquí a 2030, lograr la gestión sostenible y el uso eficiente de los recursos naturales'),(12,'3','De aquí a 2030, reducir a la mitad el desperdicio de alimentos per capita mundial...'),(12,'4','De aquí a 2020, lograr la gestión ecológicamente racional de los productos químicos...'),(12,'5','De aquí a 2030, reducir considerablemente la generación de desechos...'),(12,'6','Alentar a las empresas a adoptar prácticas sostenibles e información sobre sostenibilidad'),(12,'7','Promover prácticas de adquisición pública que sean sostenibles'),(12,'8','De aquí a 2030, asegurar que todas las personas tengan conocimientos sobre desarrollo sostenible'),(12,'a','Ayudar a los países en desarrollo a fortalecer su capacidad científica y tecnológica...'),(12,'b','Elaborar instrumentos para vigilar los efectos en el desarrollo sostenible del turismo'),(12,'c','Racionalizar los subsidios ineficientes a los combustibles fósiles...'),(13,'1','Fortalecer la resiliencia y la capacidad de adaptación a los riesgos relacionados con el clima...'),(13,'2','Incorporar medidas relativas al cambio climático en las políticas, estrategias y planes nacionales'),(13,'3','Mejorar la educación, la sensibilización y la capacidad institucional respecto del cambio climático'),(13,'a','Cumplir el compromiso de los países desarrollados de movilizar 100.000 millones de dólares anuales...'),(13,'b','Promover mecanismos de planificación y gestión eficaces en relación con el cambio climático...'),(14,'1','De aquí a 2025, prevenir y reducir significativamente la contaminación marina de todo tipo...'),(14,'2','De aquí a 2020, gestionar y proteger sosteniblemente los ecosistemas marinos y costeros...'),(14,'3','Minimizar y abordar los efectos de la acidificación de los océanos...'),(14,'4','De aquí a 2020, reglamentar eficazmente la explotación pesquera...'),(14,'5','De aquí a 2020, conservar al menos el 10% de las zonas costeras y marinas...'),(14,'6','De aquí a 2020, prohibir ciertas formas de subvenciones a la pesca...'),(14,'7','De aquí a 2030, aumentar los beneficios económicos de los recursos marinos...'),(14,'a','Aumentar los conocimientos científicos, desarrollar la capacidad de investigación y transferir tecnología marina...'),(14,'b','Facilitar el acceso de los pescadores artesanales a los recursos marinos y los mercados'),(14,'c','Mejorar la conservación y el uso sostenible de los océanos aplicando el derecho internacional...'),(15,'1','Para 2020, velar por la conservación y el uso sostenible de los ecosistemas terrestres y de agua dulce...'),(15,'2','Para 2020, promover la gestión sostenible de todos los tipos de bosques...'),(15,'3','Para 2030, luchar contra la desertificación y rehabilitar las tierras degradadas...'),(15,'4','Para 2030, velar por la conservación de los ecosistemas montañosos...'),(15,'5','Adoptar medidas urgentes para reducir la degradación de los hábitats naturales...'),(15,'6','Promover la participación justa y equitativa en los beneficios de los recursos genéticos...'),(15,'7','Adoptar medidas urgentes para poner fin a la caza furtiva y el tráfico de especies protegidas...'),(15,'8','Para 2020, prevenir la introducción de especies exóticas invasoras...'),(15,'9','Para 2020, integrar los valores de los ecosistemas y la biodiversidad en la planificación nacional...'),(15,'a','Movilizar recursos financieros para conservar y utilizar la biodiversidad de forma sostenible'),(15,'b','Movilizar recursos a todos los niveles para financiar la gestión forestal sostenible'),(15,'c','Aumentar el apoyo mundial a la lucha contra la caza furtiva y el tráfico de especies protegidas'),(16,'1','Reducir significativamente todas las formas de violencia y las tasas de mortalidad...'),(16,'10','Garantizar el acceso público a la información y proteger las libertades fundamentales'),(16,'2','Poner fin al maltrato, la explotación, la trata y todas las formas de violencia contra los niños'),(16,'3','Promover el estado de derecho y garantizar el acceso a la justicia para todos'),(16,'4','De aquí a 2030, reducir significativamente las corrientes financieras y de armas ilícitas...'),(16,'5','Reducir considerablemente la corrupción y el soborno en todas sus formas'),(16,'6','Crear instituciones eficaces, responsables y transparentes a todos los niveles'),(16,'7','Garantizar decisiones inclusivas, participativas y representativas en todos los niveles'),(16,'8','Ampliar la participación de los países en desarrollo en las instituciones de gobernanza mundial'),(16,'9','De aquí a 2030, proporcionar acceso a una identidad jurídica para todos'),(16,'a','Fortalecer las instituciones nacionales para prevenir la violencia y combatir la delincuencia'),(16,'b','Promover y aplicar leyes y políticas no discriminatorias en favor del desarrollo sostenible'),(17,'1','Fortalecer la movilización de recursos internos para mejorar la capacidad de recaudación fiscal'),(17,'10','Promover un sistema de comercio multilateral universal y equitativo'),(17,'11','Aumentar significativamente las exportaciones de los países en desarrollo'),(17,'12','Lograr el acceso libre de derechos y contingentes para todos los países menos adelantados'),(17,'13','Aumentar la estabilidad macroeconómica mundial'),(17,'14','Mejorar la coherencia de las políticas para el desarrollo sostenible'),(17,'15','Respetar el liderazgo de cada país en sus políticas de desarrollo sostenible'),(17,'16','Mejorar la Alianza Mundial mediante alianzas entre múltiples interesados'),(17,'17','Promover alianzas eficaces entre los sectores público, privado y la sociedad civil'),(17,'18','Mejorar la disponibilidad de datos desglosados en los países en desarrollo'),(17,'19','Desarrollar indicadores de desarrollo sostenible complementarios al PIB'),(17,'2','Velar por que los países desarrollados cumplan plenamente sus compromisos de asistencia oficial...'),(17,'3','Movilizar recursos financieros adicionales de múltiples fuentes para los países en desarrollo'),(17,'4','Ayudar a los países en desarrollo a lograr la sostenibilidad de la deuda a largo plazo'),(17,'5','Adoptar sistemas de promoción de inversiones en favor de los países menos adelantados'),(17,'6','Mejorar la cooperación regional e internacional en ciencia, tecnología e innovación'),(17,'7','Promover el desarrollo de tecnologías ecológicas y su transferencia a los países en desarrollo'),(17,'8','Poner en funcionamiento el banco de tecnología para los países menos adelantados'),(17,'9','Aumentar el apoyo internacional para actividades de creación de capacidad en países en desarrollo');
/*!40000 ALTER TABLE `goals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `heritage_resource_social_networks`
--

DROP TABLE IF EXISTS `heritage_resource_social_networks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `heritage_resource_social_networks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resource_id` int DEFAULT NULL,
  `social_network` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `resource_id` (`resource_id`),
  KEY `ix_heritage_resource_social_networks_id` (`id`),
  CONSTRAINT `heritage_resource_social_networks_ibfk_1` FOREIGN KEY (`resource_id`) REFERENCES `heritage_resources` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `heritage_resource_social_networks`
--

LOCK TABLES `heritage_resource_social_networks` WRITE;
/*!40000 ALTER TABLE `heritage_resource_social_networks` DISABLE KEYS */;
INSERT INTO `heritage_resource_social_networks` VALUES (12,15,'Facebook','https://www.facebook.com/MezquitaCatedraldeCordobaOficial/'),(13,16,'Facebook','https://www.facebook.com/palaciodevianacordoba/');
/*!40000 ALTER TABLE `heritage_resource_social_networks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `heritage_resource_typologies`
--

DROP TABLE IF EXISTS `heritage_resource_typologies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `heritage_resource_typologies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resource_id` int DEFAULT NULL,
  `typology` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `resource_id` (`resource_id`),
  KEY `ix_heritage_resource_typologies_id` (`id`),
  CONSTRAINT `heritage_resource_typologies_ibfk_1` FOREIGN KEY (`resource_id`) REFERENCES `heritage_resources` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `heritage_resource_typologies`
--

LOCK TABLES `heritage_resource_typologies` WRITE;
/*!40000 ALTER TABLE `heritage_resource_typologies` DISABLE KEYS */;
INSERT INTO `heritage_resource_typologies` VALUES (25,15,'Cultural'),(26,15,'Casa-patio'),(27,16,'Cultural'),(28,16,'Casa-patio'),(29,17,'Verde urbano'),(30,17,'Cultural');
/*!40000 ALTER TABLE `heritage_resource_typologies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `heritage_resources`
--

DROP TABLE IF EXISTS `heritage_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `heritage_resources`
--

LOCK TABLES `heritage_resources` WRITE;
/*!40000 ALTER TABLE `heritage_resources` DISABLE KEYS */;
INSERT INTO `heritage_resources` VALUES (15,'Mezquita-Catedral de Córdoba','Cabildo Catedral de Córdoba','Modelo Híbrido','Calle Cardenal Herrero, 1, 14003 Córdoba, España','https://mezquita-catedraldecordoba.es/','957 47 06 54'),(16,'Palacio de Viana','Fundación Cajasur','Gestión Híbrida','Pl. de Don Gome, 2, Centro, 14001 Córdoba, España','www.palaciodeviana.com','957 49 67 41'),(17,'Ciudad Califal de Medina Azahara','Junta de Andalucía','Gestión Pública','Carretera de Palma del Río, km 5.5, 14004 Córdoba, España','https://www.mezquita-catedraldecordoba.es/yacimiento-arqueologico-de-madinat-al-zahra/','957 32 91 30');
/*!40000 ALTER TABLE `heritage_resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_topics`
--

DROP TABLE IF EXISTS `material_topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_topics`
--

LOCK TABLES `material_topics` WRITE;
/*!40000 ALTER TABLE `material_topics` DISABLE KEYS */;
INSERT INTO `material_topics` VALUES (1,'Difusión y sensibilización','Comprende las diferentes acciones que se han de realizar por parte del recurso patrimonial para dar a conocer y transmitir el propio recurso y su legado, tantomaterial como inmaterial, fomentando su comunicación y difusión en todos sus ámbitos de interés de la sociedad.','high','<p>Objetivo principal 1</p>',4,'7',5),(2,'Formación','Comprende las diferentes acciones que se han de realizar por parte del recurso patrimonial para fomentar el aprendizaje y capacidades de las personas usuarias, agentes gestores y comunidad del recurso en materia vinculada al mismo. Engloba las actividades de formación ofrecidas por el propio recurso hacia las personas usuarias externas o la formación interna recibida por el propio organismo para avanzar en su gestión.','high','<p>Objetivo principal 2</p>',4,'7',5),(3,'Salud pública','Comprende las diferentes acciones que se han de realizar por parte del recurso patrimonial para controlar, evaluar, mejorar y garantizar un ambiente de confort y bienestar en el mismo, enfocado a las personas usuarias y trabajadoras. Además, pretende evaluar e implementar estrategias que contribuyan a dicho confort.','high',NULL,3,'4',5),(4,'Contratación de servicios','Comprende las diferentes acciones que se han de realizar por parte del recurso patrimonial para evaluar, controlar y gestionar los servicios contratados dentro del mismo. Esto engloba el análisis de estas contrataciones, valorando la procedencia de sus productos si los tuviera, si tienen criterios de sostenibilidad o no, las condiciones de su personal, etc.','high',NULL,12,'6',5),(5,'Economía circular y gestión de residuos','Comprende las diferentes acciones que se han de realizar por parte del recurso patrimonial para garantizar una correcta gestión de los residuos generados y fomentar un aprovechamiento de los mismos donde prime la reducción de elementos, promoviendo la utilización de materiales biodegradables que al agotar su vida útil no supongan un daño para el medioambiente.','high',NULL,12,'2',5),(6,'Gestión sostenible del recurso hídrico','Comprende las diferentes acciones que se han de realizar por parte del recurso patrimonial para administrar de manera sostenible el uso del agua en las instalaciones. Incluye plantear sistemas de almacenamiento y aprovechamiento de aguas recuperadas para su utilización en las necesidades del recurso.','high',NULL,6,'4',5),(7,'Gestión sostenible de equipamientos y mobiliario','Comprende las diferentes acciones que se han de realizar por parte del recurso patrimonial para garantizar que sus instalaciones y mobiliario sean fabricados, en la medida de lo posible, con materiales naturales, reciclados y sin tratamientos químicos, de manera que no supongan un daño para el medioambiente, para las propias personas usuarias o encargadas de su fabricación.','high',NULL,12,'2',5),(8,'Transición energética y cambio climático','Comprende las diferentes acciones que se han de realizar por parte del recurso patrimonial para implementar y desarrollar mecanismos de aprovechamiento de la energía y fomentar actuaciones para reducir el cambio climático y mermar sus efectos sobre el recurso.','high',NULL,13,'2',5),(9,'Accesibilidad e inclusión','Comprende las diferentes acciones que se han de realizar por parte del recurso patrimonial para facilitar información y ofrecer instalaciones accesibles e inclusivas del propio recurso para todas las personas, independientemente de sus condiciones socio-económicas, discapacidad u otra condición, de modo que cualquier persona pueda participar, utilizar y acceder al propio recurso de forma autónoma.','high',NULL,10,'2',5),(10,'Conservación, protección y salvaguarda del patrimonio','Comprende las diferentes acciones que se han de realizar por parte del recurso patrimonial para fomentar la conservación, la protección y la salvaguarda de todo tipo de patrimonio, natural y cultural, material e inmaterial para su uso sostenible. Subrayamos también, como lo reconoce el Consejo de Europa, la importancia en la conservación del patrimonio cultural, de la “comunidad patrimonial”. Es decir, las personas y los valores específicos del patrimonio que se desean conservar y transmitir a futuras generaciones.','high',NULL,11,'4',5),(11,'Empleo y condiciones laborales','Comprende las diferentes acciones a realizar por el recurso patrimonial para favorecer el empleo de calidad, proteger los derechos laborales y promover un entorno de trabajo seguro y sin riesgos para todos los trabajadores.','high',NULL,8,'8',5),(12,'Gestión económica sostenible','Comprende las diferentes acciones que se han de realizar por parte del recurso patrimonial para gestionar sus recursos y cuidarlos, garantizando una rentabilidad responsable y a largo plazo.','high',NULL,8,'4',5),(13,'Gestión sostenible del turismo','Comprende las diferentes acciones que se han de realizar por parte del recurso patrimonial para garantizar modalidades de consumo y producción sostenibles. La gestión sostenible del turismo tiene en cuenta las repercusiones actuales y futuras que sus acciones implican en el ámbito del recurso, tanto económicas como medioambientales o sociales e intenta que estas sean las menos posibles.','high',NULL,10,'b',5),(14,'Igualdad de oportunidades','Comprende las diferentes acciones que se han de realizar por parte del recurso patrimonial para fomentar la ausencia de toda discriminación, directa o indirecta, por motivo de discapacidad, de género o de cualquier distinción, exclusión o restricción, que tenga el efecto sobre las personas por no poder tener igualdad de condiciones en los ámbitos económico, social, laboral, cultural, etc. del propio recurso.','high',NULL,8,'5',5),(15,'Inversión y financiación','','high',NULL,11,'4',5),(16,'Transformación digital','','high',NULL,9,'4',5),(17,'Usuarios, usuarias y comunidad local','','high',NULL,11,'a',5),(18,'Gestión ética, buen gobierno y transparencia','','high',NULL,16,'6',5),(19,'Participación ciudadana','','high',NULL,16,'7',5),(20,'Alianzas y colaboraciones público-privadas','','high',NULL,17,'7',5);
/*!40000 ALTER TABLE `material_topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ods`
--

DROP TABLE IF EXISTS `ods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `dimension_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `dimension_id` (`dimension_id`),
  CONSTRAINT `ods_ibfk_1` FOREIGN KEY (`dimension_id`) REFERENCES `dimensions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ods`
--

LOCK TABLES `ods` WRITE;
/*!40000 ALTER TABLE `ods` DISABLE KEYS */;
INSERT INTO `ods` VALUES (1,'Fin de la Pobreza','Poner fin a la pobreza en todas sus formas en todo el mundo.',3),(2,'Hambre Cero','Poner fin al hambre, lograr la seguridad alimentaria, mejorar la nutrición y promover la agricultura sostenible.',3),(3,'Salud y Bienestar','Asegurar una vida sana y promover el bienestar para todos a todas las edades.',3),(4,'Educación de Calidad','Asegurar una educación inclusiva, equitativa y de calidad, y promover oportunidades de aprendizaje durante toda la vida para todos.',3),(5,'Igualdad de Género','Lograr la igualdad entre los géneros y empoderar a todas las mujeres y niñas.',3),(6,'Agua Limpia y Saneamiento','Garantizar la disponibilidad y la gestión sostenible del agua y el saneamiento para todos.',4),(7,'Energía Asequible y no Contaminante','Asegurar el acceso a una energía asequible, fiable, sostenible y moderna para todos.',5),(8,'Trabajo Decente y Crecimiento Económico','Promover un crecimiento económico sostenido, inclusivo y sostenible, el empleo pleno y productivo y el trabajo decente para todos.',5),(9,'Industria, Innovación e Infraestructura','Construir infraestructuras resilientes, promover la industrialización inclusiva y sostenible y fomentar la innovación.',5),(10,'Reducción de las Desigualdades','Reducir la desigualdad dentro y entre los países.',5),(11,'Ciudades y Comunidades Sostenibles','Hacer que las ciudades y los asentamientos humanos sean inclusivos, seguros, resilientes y sostenibles.',5),(12,'Producción y Consumo Responsables','Garantizar modalidades de producción y consumo sostenibles.',4),(13,'Acción por el Clima','Adoptar medidas urgentes para combatir el cambio climático y sus efectos.',4),(14,'Vida Submarina','Conservar y utilizar de forma sostenible los océanos, los mares y los recursos marinos para el desarrollo sostenible.',4),(15,'Vida de Ecosistemas Terrestres','Proteger, restaurar y promover el uso sostenible de los ecosistemas terrestres, gestionar sosteniblemente los bosques, luchar contra la desertificación y detener e invertir la degradación de la tierra, y detener la pérdida de biodiversidad.',4),(16,'Paz, Justicia e Instituciones Sólidas','Promover sociedades justas, pacíficas e inclusivas; brindar acceso a la justicia para todos y construir instituciones efectivas, responsables e inclusivas en todos los niveles.',6),(17,'Alianzas para Lograr los Objetivos','Fortalecer los medios de ejecución y revitalizar la Alianza Mundial para el Desarrollo Sostenible.',7);
/*!40000 ALTER TABLE `ods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_indicators`
--

DROP TABLE IF EXISTS `performance_indicators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `performance_indicators` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `human_resources` text,
  `material_resources` text,
  `type` enum('quantitative','qualitative') NOT NULL,
  `action_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `action_id` (`action_id`),
  CONSTRAINT `performance_indicators_ibfk_1` FOREIGN KEY (`action_id`) REFERENCES `actions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_indicators`
--

LOCK TABLES `performance_indicators` WRITE;
/*!40000 ALTER TABLE `performance_indicators` DISABLE KEYS */;
INSERT INTO `performance_indicators` VALUES (1,'cvbcvb','bbbb','bbbb','quantitative',7),(3,'Indicador que cambiará','UNOS','OTROS','quantitative',7);
/*!40000 ALTER TABLE `performance_indicators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_indicators_qualitative`
--

DROP TABLE IF EXISTS `performance_indicators_qualitative`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!50503 SET character_set_client = utf8mb4 */;
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
INSERT INTO `performance_indicators_quantitative` VALUES (1,5.00,'%'),(3,3.00,'miligramos');
/*!40000 ALTER TABLE `performance_indicators_quantitative` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_agreements`
--

DROP TABLE IF EXISTS `report_agreements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_agreements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agreement` text NOT NULL,
  `report_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `report_agreements_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `sustainability_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_agreements`
--

LOCK TABLES `report_agreements` WRITE;
/*!40000 ALTER TABLE `report_agreements` DISABLE KEYS */;
INSERT INTO `report_agreements` VALUES (1,'Deza supermercados',5);
/*!40000 ALTER TABLE `report_agreements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_bibliographies`
--

DROP TABLE IF EXISTS `report_bibliographies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_bibliographies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` text NOT NULL,
  `report_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `report_bibliographies_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `sustainability_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_bibliographies`
--

LOCK TABLES `report_bibliographies` WRITE;
/*!40000 ALTER TABLE `report_bibliographies` DISABLE KEYS */;
INSERT INTO `report_bibliographies` VALUES (1,'una referencia',5),(2,'otra',5);
/*!40000 ALTER TABLE `report_bibliographies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_logos`
--

DROP TABLE IF EXISTS `report_logos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_logos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `logo` varchar(255) NOT NULL,
  `report_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `report_logos_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `sustainability_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_logos`
--

LOCK TABLES `report_logos` WRITE;
/*!40000 ALTER TABLE `report_logos` DISABLE KEYS */;
INSERT INTO `report_logos` VALUES (9,'/static/uploads/logos/report_5_logo_2f470ae0-6ef8-4bc9-8da7-8379c0ef8511.jpg',5);
/*!40000 ALTER TABLE `report_logos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_norms`
--

DROP TABLE IF EXISTS `report_norms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_norms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `norm` text NOT NULL,
  `report_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `report_norms_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `sustainability_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_norms`
--

LOCK TABLES `report_norms` WRITE;
/*!40000 ALTER TABLE `report_norms` DISABLE KEYS */;
INSERT INTO `report_norms` VALUES (1,'Nueva normativa',5),(2,'Otra',5);
/*!40000 ALTER TABLE `report_norms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_photos`
--

DROP TABLE IF EXISTS `report_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `photo` varchar(255) NOT NULL,
  `report_id` int NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `report_photos_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `sustainability_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_photos`
--

LOCK TABLES `report_photos` WRITE;
/*!40000 ALTER TABLE `report_photos` DISABLE KEYS */;
INSERT INTO `report_photos` VALUES (1,'/static/uploads/gallery/report_5_photo_072797ea-5141-48fb-b71c-cf1b3997a2fa.jpg',5,'mezquita'),(5,'/static/uploads/gallery/report_5_photo_83a4ebea-39ef-43da-9506-1c9341dd3573.jpg',5,'Cabildo Catedral');
/*!40000 ALTER TABLE `report_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `secondary_ods_actions`
--

DROP TABLE IF EXISTS `secondary_ods_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
INSERT INTO `secondary_ods_actions` VALUES (1,1,11),(1,1,12),(5,7,9),(6,7,1),(6,7,3),(6,7,6),(6,7,13),(7,8,11),(7,8,13),(7,8,15),(8,8,10);
/*!40000 ALTER TABLE `secondary_ods_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `secondary_ods_material_topics`
--

DROP TABLE IF EXISTS `secondary_ods_material_topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
INSERT INTO `secondary_ods_material_topics` VALUES (12,1),(13,1),(1,2),(5,2),(8,2),(12,2),(13,2),(16,2),(6,3),(7,3),(9,3),(11,3),(12,3),(13,3),(15,3),(1,4),(2,4),(3,4),(5,4),(8,4),(9,4),(10,4),(11,4),(3,5),(6,5),(7,5),(8,5),(9,5),(11,5),(13,5),(14,5),(15,5),(3,6),(7,6),(11,6),(12,6),(13,6),(14,6),(15,6),(8,7),(9,7),(11,7),(13,7),(3,8),(6,8),(7,8),(9,8),(11,8),(12,8),(14,8),(15,8),(4,9),(5,9),(8,9),(9,9),(16,9),(4,10),(9,10),(14,10),(15,10),(1,11),(2,11),(3,11),(5,11),(10,11),(9,12),(10,12),(12,12),(16,12),(8,13),(9,13),(11,13),(12,13),(14,13),(15,13),(3,14),(4,14),(5,14),(10,14),(16,14),(1,15),(2,15),(3,15),(9,15),(10,15),(17,15),(4,16),(8,16),(10,16),(3,17),(10,17),(16,17),(17,17),(5,18),(8,18),(9,18),(10,18),(11,18),(12,18),(5,19),(10,19),(11,19),(17,19),(5,20),(9,20),(10,20),(11,20),(13,20),(16,20);
/*!40000 ALTER TABLE `secondary_ods_material_topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specific_objectives`
--

DROP TABLE IF EXISTS `specific_objectives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `specific_objectives` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text NOT NULL,
  `execution_time` varchar(100) DEFAULT NULL,
  `responsible` varchar(255) DEFAULT NULL,
  `material_topic_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `material_topic_id` (`material_topic_id`),
  CONSTRAINT `specific_objectives_ibfk_1` FOREIGN KEY (`material_topic_id`) REFERENCES `material_topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specific_objectives`
--

LOCK TABLES `specific_objectives` WRITE;
/*!40000 ALTER TABLE `specific_objectives` DISABLE KEYS */;
INSERT INTO `specific_objectives` VALUES (1,'Nuevo objetivo 1','Corto plazo','Manuel',1),(2,'NUevo objetivo 2\n','Medio Plazo',NULL,1),(3,'Nuevo objetivo 3','Largo plazo',NULL,1),(4,'Nuevo objetivo 4','Medio plazo',NULL,1),(6,'Este objetivo tiene como finalidad ser largo para que abarque lo máximo. ','es un tiempo de ejecución muy muy muy muy muy muy largo','Dolores',1),(7,'asdas','dd',NULL,4),(8,'sdsa','asdasd',NULL,4);
/*!40000 ALTER TABLE `specific_objectives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stakeholders`
--

DROP TABLE IF EXISTS `stakeholders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stakeholders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `type` enum('internal','external') NOT NULL,
  `report_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `stakeholders_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `sustainability_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stakeholders`
--

LOCK TABLES `stakeholders` WRITE;
/*!40000 ALTER TABLE `stakeholders` DISABLE KEYS */;
INSERT INTO `stakeholders` VALUES (2,'Interno de gestión de sostenibilidad','Para los del equipo','internal',5),(3,'Trabajadores','Aquellos que forman parte del trabajo en el recurso','internal',5),(4,'Visitantes','Personas que visiten el monumento','external',5);
/*!40000 ALTER TABLE `stakeholders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sustainability_reports`
--

DROP TABLE IF EXISTS `sustainability_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `action_plan_description` text,
  `internal_coherence_description` text,
  `main_impact_weight` decimal(5,2) DEFAULT NULL,
  `secondary_impact_weight` decimal(5,2) DEFAULT NULL,
  `roadmap_description` text,
  `data_tables_text` text,
  `permissions` int NOT NULL,
  `survey_state` enum('active','inactive') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `heritage_resource_id` (`heritage_resource_id`),
  CONSTRAINT `sustainability_reports_ibfk_1` FOREIGN KEY (`heritage_resource_id`) REFERENCES `heritage_resources` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sustainability_reports`
--

LOCK TABLES `sustainability_reports` WRITE;
/*!40000 ALTER TABLE `sustainability_reports` DISABLE KEYS */;
INSERT INTO `sustainability_reports` VALUES (5,15,2024,'Draft','','/static/uploads/covers/report_5_cover_51f6631d-eb15-488d-ab41-f75170f9ca76.jpg','<p>Carta par ael compromiso</p>','<p>Otro valor</p>','<p>Shiet</p>','<p>Estos son los valores: <br><br><strong>Valores</strong></p>',NULL,NULL,'<p>Esta es la descripción</p>',6,'<p>Esta es la descripción que le he puesto al Plan de acción</p>',NULL,3.00,1.00,NULL,NULL,0,'active'),(6,15,2025,'Draft','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,1.00,1.00,NULL,NULL,0,'inactive'),(7,16,2025,'Draft','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,1.00,1.00,NULL,NULL,0,'inactive'),(8,17,2025,'Draft','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,1.00,1.00,NULL,NULL,0,'active');
/*!40000 ALTER TABLE `sustainability_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sustainability_team_members`
--

DROP TABLE IF EXISTS `sustainability_team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sustainability_team_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('manager','consultant','external_advisor') NOT NULL,
  `organization` varchar(255) NOT NULL,
  `report_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_id` (`report_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `sustainability_team_members_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `sustainability_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sustainability_team_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sustainability_team_members`
--

LOCK TABLES `sustainability_team_members` WRITE;
/*!40000 ALTER TABLE `sustainability_team_members` DISABLE KEYS */;
INSERT INTO `sustainability_team_members` VALUES (5,'manager','Fundación Cajasur',5,2),(6,'consultant','Fundación Cajasur',5,4),(7,'consultant','Cabildo Catedral de Córdoba',5,17),(9,'manager','UCO',5,19),(15,'external_advisor','Prueba',5,24),(16,'consultant','asd',6,25),(27,'external_advisor','asda',6,36),(28,'external_advisor','sadasda',6,37),(29,'external_advisor','asdasf',6,38),(30,'external_advisor','asdasd',6,39),(31,'external_advisor','asdasd',7,40),(32,'external_advisor','asdfsda',8,41),(33,'external_advisor','asdas',8,42),(34,'external_advisor','sdfsdfdfff',8,43);
/*!40000 ALTER TABLE `sustainability_team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `admin` tinyint(1) NOT NULL,
  `name` varchar(100) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'i12gafej@uco.es','$2b$12$r4ELvOASVKJ7Q5mORXEqDu3VkZI6Rt3pE68IYofDyuX1X5yW6vwSq',1,'Javier','Garca Fernndez','666111666'),(2,'i12usuario@uco.es','$2b$12$r4ELvOASVKJ7Q5mORXEqDu3VkZI6Rt3pE68IYofDyuX1X5yW6vwSq',0,'Raul','Fernandez Garcia ','666111666'),(3,'i12usuario2@uco.es','$2b$12$r4ELvOASVKJ7Q5mORXEqDu3VkZI6Rt3pE68IYofDyuX1X5yW6vwSq',0,'Maria','Soria Velmonte','689773628'),(4,'i12usuario3@bing.es','$2b$12$r4ELvOASVKJ7Q5mORXEqDu3VkZI6Rt3pE68IYofDyuX1X5yW6vwSq',0,'Samuel','Santos Ordoez','689721452'),(5,'i12usuario4@bing.es','$2b$12$r4ELvOASVKJ7Q5mORXEqDu3VkZI6Rt3pE68IYofDyuX1X5yW6vwSq',0,'Dolores','Sanchez Madueo','656723023'),(6,'i12usuario5@gmail.es','$2b$12$r4ELvOASVKJ7Q5mORXEqDu3VkZI6Rt3pE68IYofDyuX1X5yW6vwSq',0,'Valeria','Mata Ramos','675646321'),(7,'i12usuario6@gmail.es','$2b$12$r4ELvOASVKJ7Q5mORXEqDu3VkZI6Rt3pE68IYofDyuX1X5yW6vwSq',0,'Rodrigo','Lopez Gomez','693840221'),(8,'i12usuario7@bing.es','$2b$12$r4ELvOASVKJ7Q5mORXEqDu3VkZI6Rt3pE68IYofDyuX1X5yW6vwSq',0,'Oliva','Muoz Perez','-'),(9,'i12usuario8@bing.es','$2b$12$r4ELvOASVKJ7Q5mORXEqDu3VkZI6Rt3pE68IYofDyuX1X5yW6vwSq',0,'Santos','Montes Segura','633214567'),(10,'i12usuario9@bing.es','$2b$12$r4ELvOASVKJ7Q5mORXEqDu3VkZI6Rt3pE68IYofDyuX1X5yW6vwSq',0,'Elena','Suarez Casas','623412347'),(11,'i12usuario10@bing.es','$2b$12$r4ELvOASVKJ7Q5mORXEqDu3VkZI6Rt3pE68IYofDyuX1X5yW6vwSq',0,'Pablo','Sanchez de Albornoz','633875647'),(12,'i12usuario11@bing.es','$2b$12$r4ELvOASVKJ7Q5mORXEqDu3VkZI6Rt3pE68IYofDyuX1X5yW6vwSq',0,'Leticia','Pedroche Ramirez','600299217'),(13,'manuvayo@uco.es','2030',0,'Manuel','Vargas Yosa','998229933'),(15,'josejimenez@uco.es','$2b$12$tgNYMobhI6dLb7UTx3NjyeWJJH/vYHthmgR2QE3tHgKGrzBC1c1je',0,'José','Jimenez',NULL),(16,'josejuan@uco.es','$2b$12$uTROact41AGxxaogzsfzQea.84h1XUEHcl4D4VwE19dhrAnkwVtQq',0,'José Juan','Jiménez Güeto',NULL),(17,'josejimenez@cuco.es','$2b$12$UwY1sYbGsZMebBScnZuzNOSJ7yCjEGWbr.mmIv2o.2IwIZNnY9Aq2',0,'Jose Juan','Jimenez Güeto',NULL),(18,'pablosoria@cuco.es','$2b$12$uYe.nTx66iEgzpDtiwOohu03cV/aDjlkoiCntlTUdlCgpEfFyJ8au',0,'Pablo','Soria',NULL),(19,'javiergarfer2003@gmail.com','$2b$12$40DtZJSlVkYtL/0SNVz0be79HHdr9YFPRgN6Iy6wrjIDVA0Gm1V86',0,'Javier','Garcia Fernandez','666184386'),(20,'marga@cuco.es','$2b$12$vfYCv27acQFxNlPZa9cJwOmA6I5zFQWJiKie93mUcEep.EdZcxu7q',0,'Maria','Garcia',NULL),(21,'marga2@cuco.es','$2b$12$HYv9VkiA13Q7xAdYVGFjEe3ZzThN5JdPRuO4H0GVeUWbz0jI8PYhu',0,'Maria','Garcia',NULL),(24,'unomas@uco.es','$2b$12$dop2fmV6wFNaYyuRczCLtuYDpxlC50oZmheDHeebfHvGL/AYo/jPG',0,'uno','mas',NULL),(25,'p@p.es','$2b$12$Ju4GcLg/dpnnbIMSQ/UxuuWcgqedwDBMB5rCfmK3Nh2boZPViH0yS',0,'Otra ','Prueba',NULL),(26,'p@p2.es','$2b$12$QeCRkOLJ/qlvEEvVyD/HWOYhmClYnG/Nz2ZSI8gU98KkF7FrD.A7K',0,'Otra P','Ueba',NULL),(27,'asdasd@uc.es','$2b$12$GU2UOB.3pCToEQuev2gtqeAiXUXFEW4hKRjMABwIyzKKKNNDi3wYu',0,'OASD','asdas',NULL),(28,'asdasd@umc.es','$2b$12$GI5JOjB8rh4P/tbW5Gm9u.4zT/Te0eMAOlZAupkBmEQbaWb95WBgC',0,'OASD','asdas',NULL),(29,'wewe@sdf.es','$2b$12$Am7LT2iHF6e5v6p4DeQZAe6FNbhMrUlbv3p1v/PZSfIJbAxBUzBvu',0,'wer1º','werweºº',NULL),(30,'asda@asd.es','$2b$12$8C2b8rgJ43ASTO9p8YH65.cbzzi66vEwSE.6hWxz3dFWb1FzAJlwW',0,'asdasd','asdas',NULL),(31,'ff@ue.es','$2b$12$X4DEguNg9qWYgZWWi75hCOVqmhdjdB2IUeFZ2Yva0B0AnkUCj1Srq',0,'dsdf','sdsdf',NULL),(32,'miaum@m.es','$2b$12$i6wi5ufrqv9XF0yyY76iG.QteU3MW5gLWvYZKdKytGs81i2E/5YhK',0,'miau','miuam',NULL),(33,'miaumhj@m.es','$2b$12$wywJk0LY.526EtYnw8zlMO84V.5nR3LlLVn8Ax74quMHuKuEIRCG2',0,'miau','miuam',NULL),(34,'sdfs@sdfs.es','$2b$12$MW6AooPuuy8dz399ZsLEy.qsj2py8kzPXkb0ZenuyV8YTKIZ/A/9a',0,' vbcx','XDXDF',NULL),(35,'sfsd@sdf.es','$2b$12$jY4x.s5o1x706oAlxkFCGuqsXWt4rPZva3uSJTN7z7EBWnIbjzDa.',0,'ddsgf','fsdfs',NULL),(36,'asdfsd@sfs.es','$2b$12$L0deudl5QLEUkuDgc8MRu.Za8U8att/3Bu4MqhCooW.8OaXuyEnga',0,'sdf','sdfsdf ',NULL),(37,'sdfsdf@sdfs.es','$2b$12$7WJfCo47vC60n6J8pQIyf.j9BcwhwrX0kKPx6QqvbKtiOZJnKrHYe',0,'sad','adsdas',NULL),(38,'asdfa@ue.es','$2b$12$FkHVJgsFBaLmAwyqOl70q.qckdiiCe0f./Ii.zKmS13fpiC59twD6',0,'asdas','asdasd',NULL),(39,'342342342@dfgd.rd','$2b$12$.uMtYxAlaEr9PJnG5pnQJuZCZqV3MFQJPoamvFvIuSJT2qi.QILLO',0,'sdfsd','sdfsdfº',NULL),(40,'dfsdf@sdfsd.es','$2b$12$vpQLV3mRhAR4aQyXMe8i0O14qUchQaZ1SzT1OA4mxJtRdB9jcm4by',0,'asdasº','dfsdf','asdas'),(41,'sdfs@sdf.es','$2b$12$qwsMfGYqnwOLmAOEu1lVx.KwwgeN0V0O7s01hO6IPIal8DM.Mw1Vi',0,'asdfsadf','222',NULL),(42,'sdfsd@esse.es','$2b$12$rDHOKtfnYKjXUtwt2226u.gFgdWTFRlyoUHjyC1dZwpK/tCJ17.ui',0,'sdfsd','sdfsdf','q'),(43,'sdfs@ue.es','$2b$12$m2oVHT1TkWRL002tgXbgVOrDno1Ikr4tWOCoIImGZdUy1kSYiDAN.',0,'fsdf','sdfsdfsd',NULL);
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

-- Dump completed on 2025-05-01 18:45:17
