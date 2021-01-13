/**
 * Copyright 2004 Ho Ngoc Duc [http://come.to/duc]. All Rights Reserved.<p>
 * Permission to use, copy, modify, and redistribute this software and its
 * documentation for personal, non-commercial use is hereby granted provided that
 * this copyright notice appears in all copies.
 */

/**
 * Upgraded VietNam events from Anh Quan Tong (github: phungorquan)
 * Can display lunar days, days of week, and events 
 * You can add more personal event in DL or AL, but need to fill correspondingly months
 */

// Solar date
var DL = [ 
["01/01-Tết Dương lịch","09/01-Ngày Sinh viên Học sinh VN"],
["03/02-Ngày thành lập ĐCSVN","14/02-Ngày Lễ tình nhân Valentine","27/02-Ngày Thầy thuốc VN"],
["08/03-Quốc tế Phụ Nữ","20/03-Quốc tế Hạnh phúc","26/03-Ngày thành lập ĐTNCS HCM","27/03-Ngày Thể thao VN"],
["01/04-Ngày Cá tháng Tư","21/04-Ngày Sách VN","22/04-Ngày Trái đất","30/04-Ngày thống nhất đất nước"],
["01/05-Quốc tế Lao Động","07/05-Ngày chiến thắng ĐBP","15/05-Quốc tế Gia đình","15/05-Ngày thành lập ĐTNTP HCM","19/05-Ngày sinh Chủ tịch HCM"],
["01/06-Quốc tế Thiếu Nhi","05/06-Ngày Môi trường Thế Giới","05/06-Ngày BH ra đi tìm đường cứu nước","28/06-Ngày Gia đình VN"],
["11/07-Ngày Dân số Thế Giới","27/07-Ngày Thương binh liệt sĩ"],
["19/08-Ngày CMT8 thành công"],
["02/09-Quốc Khánh"],
["01/10-Quốc tế Người cao tuổi","13/10-Ngày Doanh nhân VN","20/10-Ngày thành lập Hội Phụ nữ VN","31/10-Halloween Lễ hội hoá trang"],
["19/11-Quốc tế Nam giới","20/11-Ngày Nhà giáo VN"],
["01/12-Quốc tế phòng chống AIDS","03/12-Quốc tế người khuyết tật","10/12-Quốc tế nhân quyền","22/12-Ngày thành lập QĐND VN","25/12-Lễ Giáng Sinh"]
];

// Lunar date and specialEvents will be added in findSpecialDay()
var AL = [
"23/12-Tết ông Công ông Táo",
"01/01-Mùng 1 Tết Nguyên Đán",
"02/01-Mùng 2 Tết Nguyên Đán",
"03/01-Mùng 3 Tết Nguyên Đán",
"15/01-Tết Nguyên Tiêu",
"03/03-Tết Hàn thực",
"10/03-Giỗ tổ Hùng Vương",
"15/04-Lễ Phật Đản",
"05/05-Tết Đoan Ngọ",
"15/07-Lễ Vu Lan",
"15/08-Tết Trung thu",
];

var TK21 = new Array(
	0x46c960, 0x2ed954, 0x54d4a0, 0x3eda50, 0x2a7552, 0x4e56a0, 0x38a7a7, 0x5ea5d0, 0x4a92b0, 0x32aab5,
	0x58a950, 0x42b4a0, 0x2cbaa4, 0x50ad50, 0x3c55d9, 0x624ba0, 0x4ca5b0, 0x375176, 0x5c5270, 0x466930,
	0x307934, 0x546aa0, 0x3ead50, 0x2a5b52, 0x504b60, 0x38a6e6, 0x5ea4e0, 0x48d260, 0x32ea65, 0x56d520,
	0x40daa0, 0x2d56a3, 0x5256d0, 0x3c4afb, 0x6249d0, 0x4ca4d0, 0x37d0b6, 0x5ab250, 0x44b520, 0x2edd25,
	0x54b5a0, 0x3e55d0, 0x2a55b2, 0x5049b0, 0x3aa577, 0x5ea4b0, 0x48aa50, 0x33b255, 0x586d20, 0x40ad60,
	0x2d4b63, 0x525370, 0x3e49e8, 0x60c970, 0x4c54b0, 0x3768a6, 0x5ada50, 0x445aa0, 0x2fa6a4, 0x54aad0,
	0x4052e0, 0x28d2e3, 0x4ec950, 0x38d557, 0x5ed4a0, 0x46d950, 0x325d55, 0x5856a0, 0x42a6d0, 0x2c55d4,
	0x5252b0, 0x3ca9b8, 0x62a930, 0x4ab490, 0x34b6a6, 0x5aad50, 0x4655a0, 0x2eab64, 0x54a570, 0x4052b0,
	0x2ab173, 0x4e6930, 0x386b37, 0x5e6aa0, 0x48ad50, 0x332ad5, 0x582b60, 0x42a570, 0x2e52e4, 0x50d160,
	0x3ae958, 0x60d520, 0x4ada90, 0x355aa6, 0x5a56d0, 0x462ae0, 0x30a9d4, 0x54a2d0, 0x3ed150, 0x28e952
); /* Years 2000-2099 */

var TK22 = new Array(
	0x4eb520, 0x38d727, 0x5eada0, 0x4a55b0, 0x362db5, 0x5a45b0, 0x44a2b0, 0x2eb2b4, 0x54a950, 0x3cb559,
	0x626b20, 0x4cad50, 0x385766, 0x5c5370, 0x484570, 0x326574, 0x5852b0, 0x406950, 0x2a7953, 0x505aa0,
	0x3baaa7, 0x5ea6d0, 0x4a4ae0, 0x35a2e5, 0x5aa550, 0x42d2a0, 0x2de2a4, 0x52d550, 0x3e5abb, 0x6256a0,
	0x4c96d0, 0x3949b6, 0x5e4ab0, 0x46a8d0, 0x30d4b5, 0x56b290, 0x40b550, 0x2a6d52, 0x504da0, 0x3b9567,
	0x609570, 0x4a49b0, 0x34a975, 0x5a64b0, 0x446a90, 0x2cba94, 0x526b50, 0x3e2b60, 0x28ab61, 0x4c9570,
	0x384ae6, 0x5cd160, 0x46e4a0, 0x2eed25, 0x54da90, 0x405b50, 0x2c36d3, 0x502ae0, 0x3a93d7, 0x6092d0,
	0x4ac950, 0x32d556, 0x58b4a0, 0x42b690, 0x2e5d94, 0x5255b0, 0x3e25fa, 0x6425b0, 0x4e92b0, 0x36aab6,
	0x5c6950, 0x4674a0, 0x31b2a5, 0x54ad50, 0x4055a0, 0x2aab73, 0x522570, 0x3a5377, 0x6052b0, 0x4a6950,
	0x346d56, 0x585aa0, 0x42ab50, 0x2e56d4, 0x544ae0, 0x3ca570, 0x2864d2, 0x4cd260, 0x36eaa6, 0x5ad550,
	0x465aa0, 0x30ada5, 0x5695d0, 0x404ad0, 0x2aa9b3, 0x50a4d0, 0x3ad2b7, 0x5eb250, 0x48b540, 0x33d556
); /* Years 2100-2199 */

var CAN = new Array("Gi\341p", "\u1EA4t", "B\355nh", "\u0110inh", "M\u1EADu", "K\u1EF7", "Canh", "T\342n", "Nh\342m", "Qu\375");
var CHI = new Array("T\375", "S\u1EEDu", "D\u1EA7n", "M\343o", "Th\354n", "T\u1EF5", "Ng\u1ECD", "M\371i", "Th\342n", "D\u1EADu", "Tu\u1EA5t", "H\u1EE3i");
var TUAN = new Array("CN", "T2", "T3", "T4", "T5", "T6", "T7");
var GIO_HD = new Array("110100101100", "001101001011", "110011010010", "101100110100", "001011001101", "010010110011");
var TIETKHI = new Array("Xu\u00E2n ph\u00E2n", "Thanh minh", "C\u1ED1c v\u0169", "L\u1EADp h\u1EA1", "Ti\u1EC3u m\u00E3n", "Mang ch\u1EE7ng",
	"H\u1EA1 ch\u00ED", "Ti\u1EC3u th\u1EED", "\u0110\u1EA1i th\u1EED", "L\u1EADp thu", "X\u1EED th\u1EED", "B\u1EA1ch l\u1ED9",
	"Thu ph\u00E2n", "H\u00E0n l\u1ED9", "S\u01B0\u01A1ng gi\u00E1ng", "L\u1EADp \u0111\u00F4ng", "Ti\u1EC3u tuy\u1EBFt", "\u0110\u1EA1i tuy\u1EBFt",
	"\u0110\u00F4ng ch\u00ED", "Ti\u1EC3u h\u00E0n", "\u0110\u1EA1i h\u00E0n", "L\u1EADp xu\u00E2n", "V\u0169 Th\u1EE7y", "Kinh tr\u1EADp"
);

/* Create lunar date object, stores (lunar) date, month, year, leap month indicator, and Julian date number */
function LunarDate(dd, mm, yy, leap, jd) {
	this.day = dd;
	this.month = mm;
	this.year = yy;
	this.leap = leap;
	this.jd = jd;
}

var PI = Math.PI;
var FIRST_DAY = jdn(31, 1, 1200);
var LAST_DAY = jdn(31, 12, 2199);

/* Discard the fractional part of a number, e.g., INT(3.2) = 3 */
function INT(d) {
	return Math.floor(d);
}

function jdn(dd, mm, yy) {
	var a = INT((14 - mm) / 12);
	var y = yy+4800-a;
	var m = mm+12*a-3;
	var jd = dd + INT((153*m+2)/5) + 365*y + INT(y/4) - INT(y/100) + INT(y/400) - 32045;
	if (jd < 2299161) {
		jd = dd + INT((153*m+2)/5) + 365*y + INT(y/4) - 32083;
	}
	return jd;
}

function jdn2date(jd) {
	var Z, A, alpha, B, C, D, E, dd, mm, yyyy, F;
	Z = jd;
	if (Z < 2299161) {
	  A = Z;
	} else {
	  alpha = INT((Z-1867216.25)/36524.25);
	  A = Z + 1 + alpha - INT(alpha/4);
	}
	B = A + 1524;
	C = INT( (B-122.1)/365.25);
	D = INT( 365.25*C );
	E = INT( (B-D)/30.6001 );
	dd = INT(B - D - INT(30.6001*E));
	if (E < 14) {
	  mm = E - 1;
	} else {
	  mm = E - 13;
	}
	if (mm < 3) {
	  yyyy = C - 4715;
	} else {
	  yyyy = C - 4716;
	}
	return new Array(dd, mm, yyyy, jd);
}

function decodeLunarYear(yy, k) {
	var monthLengths, regularMonths, offsetOfTet, leapMonth, leapMonthLength, solarNY, currentJD, j, mm;
	var ly = new Array();
	monthLengths = new Array(29, 30);
	regularMonths = new Array(12);
	offsetOfTet = k >> 17;
	leapMonth = k & 0xf;
	leapMonthLength = monthLengths[k >> 16 & 0x1];
	solarNY = jdn(1, 1, yy);
	currentJD = solarNY+offsetOfTet;
	j = k >> 4;
	for(i = 0; i < 12; i++) {
		regularMonths[12 - i - 1] = monthLengths[j & 0x1];
		j >>= 1;
	}
	if (leapMonth == 0) {
		for(mm = 1; mm <= 12; mm++) {
			ly.push(new LunarDate(1, mm, yy, 0, currentJD));
			currentJD += regularMonths[mm-1];
		}
	} else {
		for(mm = 1; mm <= leapMonth; mm++) {
			ly.push(new LunarDate(1, mm, yy, 0, currentJD));
			currentJD += regularMonths[mm-1];
		}
		ly.push(new LunarDate(1, leapMonth, yy, 1, currentJD));
		currentJD += leapMonthLength;
		for(mm = leapMonth+1; mm <= 12; mm++) {
			ly.push(new LunarDate(1, mm, yy, 0, currentJD));
			currentJD += regularMonths[mm-1];
		}
	}
	return ly;
}

function getYearInfo(yyyy) {
	var yearCode;
	if (yyyy < 2000) {
		yearCode = TK20[yyyy - 1900];
	} else if (yyyy < 2100) {
		yearCode = TK21[yyyy - 2000];
	} else {
		yearCode = TK22[yyyy - 2100];
	}
	return decodeLunarYear(yyyy, yearCode);
}

function findLunarDate(jd, ly) {
	if (jd > LAST_DAY || jd < FIRST_DAY || ly[0].jd > jd) {
		return new LunarDate(0, 0, 0, 0, jd);
	}
	var i = ly.length-1;
	while (jd < ly[i].jd) {
		i--;
	}
	var off = jd - ly[i].jd;
	ret = new LunarDate(ly[i].day+off, ly[i].month, ly[i].year, ly[i].leap, jd);
	return ret;
}

function getLunarDate(dd, mm, yyyy) {
	var ly, jd;
	if (yyyy < 1200 || 2199 < yyyy) {
		return new LunarDate(0, 0, 0, 0, 0);
	}
	ly = getYearInfo(yyyy);
	jd = jdn(dd, mm, yyyy);
	if (jd < ly[0].jd) {
		ly = getYearInfo(yyyy - 1);
	}
	return findLunarDate(jd, ly);
}

function getSolarDate(dd, mm, yyyy) {
	if (yyyy < 1200 || 2199 < yyyy) {
		return new LunarDate(0, 0, 0, 0, 0);
	}
	var ly = getYearInfo(yyyy);
	var lm = ly[mm-1];
	if (lm.month != mm) {
		lm = ly[mm];
	}
	var ld = lm.jd + dd - 1;
	return jdn2date(ld);
}

function getYearCanChi(year) {
	return CAN[(year+6) % 10] + " " + CHI[(year+8) % 12];
}

// Sort any day in DL[i] when add to this array (DESCREMENT)
function sortDayINC(dayOfEvent,monthOfEvent,title){
	var indexDL = 0;
	var sortEvent = false;
	var tmpArr = [];
	for(var numOfDate = 0; numOfDate < DL[monthOfEvent-1].length + 1; numOfDate++)
	{
		// Check one by one DL
		if(indexDL != DL[monthOfEvent-1].length)
		{
			var firstSplit = DL[monthOfEvent-1][indexDL].split('-'); // [date/month],[title]
			var secondSplit = firstSplit[0].split('/'); // [date],[month]
			// If does not sort 
			if(!sortEvent)
			{
				// If DL > eventDate, -> print eventDate first
				if(secondSplit[0] > dayOfEvent)
				{
					var getDate = ("0" + dayOfEvent).slice(-2); // Convert to 2 digits
					var getMonth = ("0" + monthOfEvent).slice(-2); // Convert to 2 digits
					var combineStr =  getDate + "/" + getMonth + title;
					tmpArr.push(combineStr);
					sortEvent = true;
				}
				// Else print DL after that
				else {
					tmpArr.push(DL[monthOfEvent-1][indexDL]);	
					indexDL++;
				}
			}
			// If done, then just print DL
			else {
				tmpArr.push(DL[monthOfEvent-1][indexDL]);		
				indexDL++;
			}
		}
		// If done DL, -> just print eventDate
		else{
			var getDate = ("0" + dayOfEvent).slice(-2); // Convert to 2 digits
			var getMonth = ("0" + monthOfEvent).slice(-2); // Convert to 2 digits
			var combineStr =  getDate + "/" + getMonth + title;
			tmpArr.push(combineStr);
		}
	}
	return tmpArr;
}

// Get special day and add to AL array
// You should add from DES to INC
function findSpecialDay(){
	var motherMonth = 5;
	var fatherMonth = 6;
	var thanksGVMonth = 11;
	var counterMother = 0;
	var counterFather = 0;
	var counterThanksGV = 0;
	var now = new Date();
	var getYear = now.getFullYear();
		
	// EASTER
	var f = Math.floor,
		// Golden Number - 1
		G = getYear % 19,
		C = f(getYear / 100),
		// related to Epact
		H = (C - f(C / 4) - f((8 * C + 13)/25) + 19 * G + 15) % 30,
		// number of days from 21 March to the Paschal full moon
		I = H - f(H/28) * (1 - f(29/(H + 1)) * f((21-G)/11)),
		// weekday for the Paschal full moon
		J = (getYear + f(getYear / 4) + I + 2 - C + f(C / 4)) % 7,
		// number of days from 21 March to the Sunday on or before the Paschal full moon
		L = I - J,
		getMonthEASTER = 3 + f((L + 40)/44),
		getDayEASTER = L + 28 - 31 * f(getMonthEASTER / 4);

	DL[getMonthEASTER-1] = sortDayINC(getDayEASTER,getMonthEASTER,"-Lễ Phục Sinh");

	// MOTHER DAY, FATHER DAY, THANKS GIVING, BLACK FRIDAY
	for(var i = 1; i <= 31; i++)
	{
		if(TUAN[(jdn2date(jdn(i,motherMonth,getYear))[3]+1) % 7] == "CN" && counterMother != 2)
		{
			counterMother++;
			if (counterMother == 2)
				DL[motherMonth-1] = sortDayINC(i,motherMonth,"-Ngày của Mẹ");
		}
		if(TUAN[(jdn2date(jdn(i,fatherMonth,getYear))[3]+1) % 7] == "CN" && counterFather != 3)
		{
			counterFather++;
			if (counterFather == 3)
				DL[fatherMonth-1] = sortDayINC(i,fatherMonth,"-Ngày của Cha");
		}

		if(TUAN[(jdn2date(jdn(i,thanksGVMonth,getYear))[3]+1) % 7] == "T5" && counterThanksGV != 4)
		{
			counterThanksGV++;
			if (counterThanksGV == 4)
			{
				DL[thanksGVMonth-1] = sortDayINC(i,thanksGVMonth,"-Lễ tạ ơn");
				DL[thanksGVMonth-1] = sortDayINC(i+1,thanksGVMonth,"-BlackFriday");
			}
		}
	}
}

findSpecialDay();

// Convert AL to DL, respectively
function ALtoDL(month){
	var ALarr = [];
	var now = new Date();
	var getYear = now.getFullYear();
	var getDL;

	for(var i = 0; i < AL.length; i++)
	{
		var firstSplit = AL[i].split('-'); // [date/month],[title]
		var secondSplit = firstSplit[0].split('/'); // [date],[month]
		var getDate = secondSplit[0];
		var getMonth = secondSplit[1];

		getDL = getSolarDate(parseInt(getDate),parseInt(getMonth),getYear);
		if(i == 0)
		{	
			// The first day is 23/12, this belong to previous year
			getDL = getSolarDate(parseInt(getDate),parseInt(getMonth),getYear - 1);
		}

		// If has AL events in month
		if(getDL[1] == month)
		{	
			// Create an array with 3 value: index, date, month 
			ALarr.push(i);
			ALarr.push(("0" + getDL[0]).slice(-2));
			ALarr.push(("0" + getDL[1]).slice(-2));
		}
	}
	return ALarr;
}

// Print events	
function getEvent(month){
	/*Create an Array include 3 value: index, date, month of AL[month+1] which convert to DL 
	E.g in array:
	 	0, 12, 2    // [0],[1],[2]
		1, 31, 10	// [3],[4],[5]
		5, 23, 1    // [6],[7],[8] 
		........	.......
	Each block include 3 value, then i have to * 3 to jump to next data blocks
	*/

	var getALArr = ALtoDL(month+1);
	var getALArrLength = 0;
	var indexDL = 0;
	var indexAL = 0;
	var tmpArr = [];

	// If AL[month] does not has any events
	if(getALArr.length == 0)
	{
		for(var i = 0 ; i < DL[month].length; i++)
			tmpArr.push(DL[month][i]);
	}
	else {
		getALArrLength = (getALArr.length / 3);

		for(var numOfDate = 0; numOfDate < DL[month].length + getALArrLength; numOfDate++)
		{
			// Check one by one DL in DL[month]
			if(indexDL != DL[month].length)
			{
				// Decompose to get date to compare
				var firstSplit = DL[month][indexDL].split('-');  // [date/month],[title]
				var secondSplit = firstSplit[0].split('/');	// [date],[month]

				// Compare one by one AL
				if(indexAL < getALArrLength)
				{
					// If DL > AL -> print AL first
					if(parseInt(secondSplit[0]) > parseInt(getALArr[indexAL*3+1]))
					{	
						var getTitle = AL[getALArr[indexAL*3]].split('-'); // [date/month],[title]
						var getDate = ("0" + getALArr[indexAL*3 + 1]).slice(-2); // Convert to 2 digits
						var getMonth = ("0" + getALArr[indexAL*3 + 2]).slice(-2); // Convert to 2 digits

						tmpArr.push(getDate +"/"+ getMonth +'-'+ getTitle[1]);
						indexAL++;
					}
					// Else print DL after
					else {
						tmpArr.push(DL[month][indexDL]);
						indexDL++;
					}	
				}
				// If done, then just print DL
				else {
					tmpArr.push(DL[month][indexDL]);
					indexDL++;
				}
			}
			// If done DL, -> just print AL
			else{
				var getTitle = AL[getALArr[indexAL*3]].split('-'); // [date/month],[title]
				var getDate = ("0" + getALArr[indexAL*3 + 1]).slice(-2); // Convert to 2 digits
				var getMonth = ("0" + getALArr[indexAL*3 + 2]).slice(-2); // Convert to 2 digits

				tmpArr.push(getDate +"/"+ getMonth +'-'+ getTitle[1]);
				indexAL++;
			}
		}
	}
	return tmpArr;
}