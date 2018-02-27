SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS ffvldecollage CHARACTER SET utf8 COLLATE utf8_general_ci;

USE ffvldecollage;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE IF NOT EXISTS discipline (
  id_discipline int(11) NOT NULL AUTO_INCREMENT,
  code varchar(50) NOT NULL,
  nom varchar(50) NOT NULL,
  PRIMARY KEY (id_discipline)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

INSERT INTO discipline VALUES
(1, 'D', 'deltaplane'),
(2, 'P', 'parapente');

CREATE TABLE IF NOT EXISTS orientation (
  Id_orientation int(11) NOT NULL AUTO_INCREMENT,
  Nom int(50) DEFAULT NULL,
  Degre varchar(50) DEFAULT NULL,
  Code varchar(3) DEFAULT NULL,
  PRIMARY KEY (Id_orientation)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;

INSERT INTO orientation VALUES
(1, 0, '348,75 à 11,25', 'N'),
(2, 0, '11,25 à 33,75', 'NNE'),
(3, 0, '33,75 à 56,25', 'NE'),
(4, 0, '56,25 à 78,75', 'ENE'),
(5, 0, '78,75 à 101,25', 'E'),
(6, 0, '101,25 à 123,75', 'ESE'),
(7, 0, '123,75 à 146,25', 'SE'),
(8, 0, '146,25 à 168,75', 'SSE'),
(9, 0, '168,75 à 191,25', 'S'),
(10, 0, '191,25 à 213,75', 'SSO'),
(11, 0, '213,75 à 236,25', 'SO'),
(12, 0, '236,25 à 258,75', 'OSO'),
(13, 0, '258,75 à 281,25', 'O'),
(14, 0, '281,25 à 303,75', 'ONO'),
(15, 0, '303,75 à 326,25', 'NO'),
(16, 0, '326,25 à 348,75', 'NNO');

CREATE TABLE IF NOT EXISTS sites (
  identifiant int(11) NOT NULL,
  nom varchar(150) DEFAULT NULL,
  codepostal varchar(10) DEFAULT NULL,
  lat decimal(10,0) DEFAULT NULL,
  lon decimal(10,0) DEFAULT NULL,
  structure int(11) DEFAULT NULL,
  id_structure int(11) DEFAULT NULL,
  last_update datetime DEFAULT NULL,
  orientations set('N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO') DEFAULT NULL,
  pratiques set('delta','parapente') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS site_discipline (
  id_site_discipline int(11) NOT NULL AUTO_INCREMENT,
  id_site int(11) NOT NULL,
  id_discipline int(11) NOT NULL,
  PRIMARY KEY (id_site_discipline)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS site_orientation (
  id_site_orientation int(11) NOT NULL AUTO_INCREMENT,
  id_site int(11) NOT NULL,
  id_orientation int(11) NOT NULL,
  PRIMARY KEY (id_site_orientation)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE USER 'test'@'localhost' IDENTIFIED BY 'test';
USE ffvldecollage;
GRANT ALL PRIVILEGES ON ffvldecollage.* TO 'test'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
COMMIT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
