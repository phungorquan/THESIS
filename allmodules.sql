-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 04, 2021 at 10:57 AM
-- Server version: 10.4.14-MariaDB
-- PHP Version: 7.2.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `modules`
--

-- --------------------------------------------------------

--
-- Table structure for table `allmodules`
--

CREATE TABLE `allmodules` (
  `ID` tinyint(4) NOT NULL,
  `NAME` varchar(30) COLLATE utf8_vietnamese_ci NOT NULL,
  `REALNAME` varchar(30) COLLATE utf8_vietnamese_ci NOT NULL,
  `MASKNAME` varchar(30) COLLATE utf8_vietnamese_ci NOT NULL,
  `STATUS` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_vietnamese_ci;

--
-- Dumping data for table `allmodules`
--

INSERT INTO `allmodules` (`ID`, `NAME`, `REALNAME`, `MASKNAME`, `STATUS`) VALUES
(1, 'clock', 'clock', 'Đồng hồ', 1),
(2, 'mmmvietnamcalendar', 'MMM-VietnamCalendar', 'Lịch Việt', 0),
(3, 'mmmfacenet', 'MMM-FaceNet', 'Xử lý ảnh', 0),
(4, 'mmmcursor', 'MMM-Cursor', 'Con trỏ chuột', 1),
(5, 'mmmws2812', 'MMM-WS2812', 'Đèn Led', 0),
(6, 'mmmsnow', 'MMM-Snow', 'Hiệu ứng tuyết', 0),
(7, 'alert', 'alert', 'Thông báo', 0),
(8, 'mmmnewsqr', 'MMM-News-QR', 'Mã QR', 0),
(9, 'newsfeed', 'newsfeed', 'Tin tức', 0),
(10, 'currentweather', 'currentweather', 'Thời tiết hiện tại', 0),
(11, 'weatherforecast', 'weatherforecast', 'Thời tiết', 0),
(12, 'mmmgoogleassistant', 'MMM-GoogleAssistant', 'Trợ lý ảo', 0),
(13, 'mmmassistant2display', 'MMM-Assistant2Display', 'Hỗ trợ G.A', 0),
(14, 'mmmtools', 'MMM-Tools', 'Thông tin Pi', 0),
(15, 'mmmgrovegestures', 'MMM-GroveGestures', 'Cử chỉ', 0),
(16, 'mmmpageindicator', 'MMM-page-indicator', 'Chỉ thị số trang', 0),
(17, 'mmmpages', 'MMM-pages', 'Quản lý trang', 0),
(18, 'mmmgoogledriveslideshow', 'MMM-GoogleDriveSlideShow', 'Trình chiếu hình', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `allmodules`
--
ALTER TABLE `allmodules`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `allmodules`
--
ALTER TABLE `allmodules`
  MODIFY `ID` tinyint(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
