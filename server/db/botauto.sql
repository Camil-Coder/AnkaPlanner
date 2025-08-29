-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-08-2025 a las 02:48:26
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `botauto`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dia_rastreo`
--

CREATE TABLE `dia_rastreo` (
  `ID_DIA_RASTREO` int(11) NOT NULL,
  `NOMBRE_DIA_RASTREO` varchar(6) DEFAULT NULL,
  `RUTA_DIA_RASTREO_RED` text DEFAULT NULL,
  `RUTA_DIA_RASTREO_GEO` text DEFAULT NULL,
  `_ID_PROYECTO` int(11) NOT NULL,
  `_ID_TOPOGRAFO` int(11) NOT NULL,
  `_ID_EMPRESA` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresa`
--

CREATE TABLE `empresa` (
  `ID_EMPRESA` int(11) NOT NULL,
  `NOMBRE_EMPRESA` varchar(60) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `empresa`
--

INSERT INTO `empresa` (`ID_EMPRESA`, `NOMBRE_EMPRESA`) VALUES
(3, 'GERS'),
(1, 'OPTIMA'),
(2, 'SIGNUM'),
(4, 'TEST');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `excel_cambio_epoca`
--

CREATE TABLE `excel_cambio_epoca` (
  `ID_EXCEL_CAMBIO_EPOCA` int(11) NOT NULL,
  `RUTA_EXCEL` text DEFAULT NULL,
  `FECHA_CREACION` date DEFAULT NULL,
  `_ID_PROYECTO` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gps_base`
--

CREATE TABLE `gps_base` (
  `ID_GPS_BASE` int(11) NOT NULL,
  `NOMBRE_GPS_BASE` varchar(45) DEFAULT NULL,
  `RUTA_NAV_GPS_BASE` text DEFAULT NULL,
  `RUTA_OBS_GPS_BASE` text DEFAULT NULL,
  `_ID_DIA_RASTREO` int(11) NOT NULL,
  `_ID_PROYECTO` int(11) NOT NULL,
  `_ID_TOPOGRAFO` int(11) NOT NULL,
  `_ID_EMPRESA` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyecto`
--

CREATE TABLE `proyecto` (
  `ID_PROYECTO` int(11) NOT NULL,
  `NOMBRE_PROYECTO` varchar(45) DEFAULT NULL,
  `FECHA_CREACION` datetime DEFAULT NULL,
  `RUTA_PROYECTO` text DEFAULT NULL,
  `RADIO_BUSQUEDA` int(11) DEFAULT NULL,
  `ESTADO_RED` varchar(45) DEFAULT NULL,
  `ESTADO_GEO` varchar(45) DEFAULT NULL,
  `_ID_TOPOGRAFO` int(11) NOT NULL,
  `_ID_EMPRESA` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `ID_REPORTE` int(11) NOT NULL,
  `RUTA_NAV` text DEFAULT NULL,
  `RUTA_FIX` text DEFAULT NULL,
  `RUTA_DIF` text DEFAULT NULL,
  `_ID_DIA_RASTREO` int(11) NOT NULL,
  `_ID_PROYECTO` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `topografo`
--

CREATE TABLE `topografo` (
  `ID_TOPOGRAFO` int(11) NOT NULL,
  `NOMBRE_TOPOGRAFO` varchar(80) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `topografo`
--

INSERT INTO `topografo` (`ID_TOPOGRAFO`, `NOMBRE_TOPOGRAFO`) VALUES
(1, 'JEFFERSON BETANCOURT'),
(2, 'JOSE CERON'),
(3, 'JORDAN AVILA');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `dia_rastreo`
--
ALTER TABLE `dia_rastreo`
  ADD PRIMARY KEY (`ID_DIA_RASTREO`,`_ID_PROYECTO`,`_ID_TOPOGRAFO`,`_ID_EMPRESA`),
  ADD UNIQUE KEY `RUTA_DIA_RASTREO_UNIQUE` (`RUTA_DIA_RASTREO_RED`) USING HASH,
  ADD KEY `fk_DIA_RASTREO_PROYECTO1_idx` (`_ID_PROYECTO`,`_ID_TOPOGRAFO`,`_ID_EMPRESA`);

--
-- Indices de la tabla `empresa`
--
ALTER TABLE `empresa`
  ADD PRIMARY KEY (`ID_EMPRESA`),
  ADD UNIQUE KEY `NOMBRE_EMPRESA_UNIQUE` (`NOMBRE_EMPRESA`);

--
-- Indices de la tabla `excel_cambio_epoca`
--
ALTER TABLE `excel_cambio_epoca`
  ADD PRIMARY KEY (`ID_EXCEL_CAMBIO_EPOCA`,`_ID_PROYECTO`),
  ADD KEY `fk_EXCEL_CAMBIO_EPOCA_PROYECTO1_idx` (`_ID_PROYECTO`);

--
-- Indices de la tabla `gps_base`
--
ALTER TABLE `gps_base`
  ADD PRIMARY KEY (`ID_GPS_BASE`,`_ID_DIA_RASTREO`,`_ID_PROYECTO`,`_ID_TOPOGRAFO`,`_ID_EMPRESA`),
  ADD KEY `fk_GPS_BASE_DIA_RASTREO1_idx` (`_ID_DIA_RASTREO`,`_ID_PROYECTO`,`_ID_TOPOGRAFO`,`_ID_EMPRESA`);

--
-- Indices de la tabla `proyecto`
--
ALTER TABLE `proyecto`
  ADD PRIMARY KEY (`ID_PROYECTO`,`_ID_TOPOGRAFO`,`_ID_EMPRESA`),
  ADD UNIQUE KEY `NOMBRE_PROYECTO_UNIQUE` (`NOMBRE_PROYECTO`),
  ADD KEY `fk_PROYECTO_TOPOGRAFO1_idx` (`_ID_TOPOGRAFO`),
  ADD KEY `fk_PROYECTO_EMPRESA1_idx` (`_ID_EMPRESA`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`ID_REPORTE`,`_ID_DIA_RASTREO`,`_ID_PROYECTO`),
  ADD KEY `fk_FIX_DIA_RASTREO1_idx` (`_ID_DIA_RASTREO`,`_ID_PROYECTO`);

--
-- Indices de la tabla `topografo`
--
ALTER TABLE `topografo`
  ADD PRIMARY KEY (`ID_TOPOGRAFO`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `dia_rastreo`
--
ALTER TABLE `dia_rastreo`
  MODIFY `ID_DIA_RASTREO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `empresa`
--
ALTER TABLE `empresa`
  MODIFY `ID_EMPRESA` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `excel_cambio_epoca`
--
ALTER TABLE `excel_cambio_epoca`
  MODIFY `ID_EXCEL_CAMBIO_EPOCA` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `gps_base`
--
ALTER TABLE `gps_base`
  MODIFY `ID_GPS_BASE` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `proyecto`
--
ALTER TABLE `proyecto`
  MODIFY `ID_PROYECTO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `ID_REPORTE` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `topografo`
--
ALTER TABLE `topografo`
  MODIFY `ID_TOPOGRAFO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `dia_rastreo`
--
ALTER TABLE `dia_rastreo`
  ADD CONSTRAINT `fk_DIA_RASTREO_PROYECTO1` FOREIGN KEY (`_ID_PROYECTO`,`_ID_TOPOGRAFO`,`_ID_EMPRESA`) REFERENCES `proyecto` (`ID_PROYECTO`, `_ID_TOPOGRAFO`, `_ID_EMPRESA`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `excel_cambio_epoca`
--
ALTER TABLE `excel_cambio_epoca`
  ADD CONSTRAINT `fk_EXCEL_CAMBIO_EPOCA_PROYECTO1` FOREIGN KEY (`_ID_PROYECTO`) REFERENCES `proyecto` (`ID_PROYECTO`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `gps_base`
--
ALTER TABLE `gps_base`
  ADD CONSTRAINT `fk_GPS_BASE_DIA_RASTREO1` FOREIGN KEY (`_ID_DIA_RASTREO`,`_ID_PROYECTO`,`_ID_TOPOGRAFO`,`_ID_EMPRESA`) REFERENCES `dia_rastreo` (`ID_DIA_RASTREO`, `_ID_PROYECTO`, `_ID_TOPOGRAFO`, `_ID_EMPRESA`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `proyecto`
--
ALTER TABLE `proyecto`
  ADD CONSTRAINT `fk_PROYECTO_EMPRESA1` FOREIGN KEY (`_ID_EMPRESA`) REFERENCES `empresa` (`ID_EMPRESA`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_PROYECTO_TOPOGRAFO1` FOREIGN KEY (`_ID_TOPOGRAFO`) REFERENCES `topografo` (`ID_TOPOGRAFO`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD CONSTRAINT `fk_FIX_DIA_RASTREO1` FOREIGN KEY (`_ID_DIA_RASTREO`,`_ID_PROYECTO`) REFERENCES `dia_rastreo` (`ID_DIA_RASTREO`, `_ID_PROYECTO`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
