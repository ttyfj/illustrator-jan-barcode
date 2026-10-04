// This script is public domain.
// Created by Tatsuya Fujii.
// https://blue.mints.ne.jp/jan/
// https://github.com/ttyfj/illustrator-jan-barcode
// version 10
// Released Oct 5, 2026



main();

// 必要に応じて処理をreturn;で止めるため、全体を関数main()で包む
function main() {


// ダイアログ
var dlg = new Window("dialog", "バーコードの設定");
dlg.alignChildren = ["left", "top"]; // 要素を左寄せに配置

dlg.add("statictext", undefined, "JAN-13またはJAN-8");
var janInput = dlg.add("edittext", undefined, "");
janInput.characters = 13;

dlg.add("statictext", undefined, "線幅 (pt)");
var widthInput = dlg.add("edittext", undefined, "1");
widthInput.characters = 10;

dlg.add("statictext", undefined, "バーコードの高さ (pt)");
var heightInput = dlg.add("edittext", undefined, "65");
heightInput.characters = 10;

var isEqualHeight = dlg.add("checkbox", undefined, "バーの下端を揃える");
isEqualHeight.value = false; // デフォルトOFF

var numberPanel = dlg.add("panel", undefined, "数字");
numberPanel.orientation = "column";
numberPanel.alignChildren = "left";

var rbText = numberPanel.add("radiobutton", undefined, "テキスト");
var rbOutline = numberPanel.add("radiobutton", undefined, "アウトライン");
var rbNone = numberPanel.add("radiobutton", undefined, "なし");

rbText.value = true; // デフォルト選択
    
    
var btns = dlg.add("group");
btns.alignment = "right";
btns.add("button", undefined, "キャンセル", {name:"cancel"});  // {name:"cancel"} のボタンが押されると dlg.show() の戻り値は 2 になる（仕様）
btns.add("button", undefined, "OK", {name:"ok"});  // {name:"ok"} のボタンが押されると dlg.show() の戻り値は 1 になる（仕様）



if (dlg.show() != 1) return;


// 数値化
var jan = janInput.text;
var lineWidth = Number(widthInput.text);
var barcodeHeight = Number(heightInput.text);

var numberMode = "text";
if (rbOutline.value) {
	numberMode = "outline";
} else if (rbNone.value) {
	numberMode = "none";
}

var customFontName = "";

var defaultBarColorDef = {c: 0, m: 0, y: 0, k: 100, r: 0, g: 0, b: 0};
var defaultNumberColorDef = {c: 0, m: 0, y: 0, k: 100, r: 0, g: 0, b: 0};
var defaultBackgroundColorDef = {c: 0, m: 0, y: 0, k: 0, r: 255, g: 255, b: 255};







///////////////////////////////////////////////////////////
// 以下で設定のカスタムができます
// ダイアログで入力した設定よりも優先されます
// 有効にしたい場合は、その項目の行頭の // を取り除いて下さい
// 各々の説明文の行頭の // は消さないでください。消すとエラーが発生します。


// JANコードを設定します
// jan = "2012345678903";

// 線幅を設定します
// lineWidth = 1;

// バーコードの高さを設定します
// barcodeHeight = 65;

// バーの下端を揃える場合はtrue、揃えないでヒゲを付ける場合はfalseに設定します
// isEqualHeight.value = false;

// 数字の表記に使うフォント。PostScript名で記述します
// customFontName = "Helvetica";

// 数字をテキストで描画するにはtext、アウトライン化して描画するにはoutline、数字を描画しない場合はnoneにします
// numberMode = "text";

// 線の色を指定。CMYKとRGBの両方を入力しておくとカラーモードに合わせて自動選択されます
// c,m,y,kの各値は0〜100の数字で、r,g,bの各値は0〜255の数字で記述して下さい
// var customBarColorDef = {c: 0, m: 0, y: 0, k: 100, r: 0, g: 0, b: 0};

// 数字の色を指定。CMYKとRGBの両方を入力しておくとカラーモードに合わせて自動選択されます
// c,m,y,kの各値は0〜100の数字で、r,g,bの各値は0〜255の数字で記述して下さい
// var customNumberColorDef = {c: 0, m: 0, y: 0, k: 100, r: 0, g: 0, b: 0};

// 背景の色を指定。CMYKとRGBの両方を入力しておくとカラーモードに合わせて自動選択されます
// c,m,y,kの各値は0〜100の数字で、r,g,bの各値は0〜255の数字で記述して下さい
// var customBackgroundColorDef = {c: 0, m: 0, y: 0, k: 0, r: 255, g: 255, b: 255};


// 設定のカスタム、ここまで
///////////////////////////////////////////////////////////








// バーの下端を「揃える／揃えない」で、伸ばすヒゲの有無を設定する。
var additionalHeight;
if (isEqualHeight.value  === false) {
	additionalHeight = 1;
} else {
	additionalHeight = 0;
}


// 入力されたデータの検証
if (!/^(?:\d{7,8}|\d{12,13})$/.test(jan)) {
	alert("JANコードは、JAN-13では12桁または13桁で、JAN-8では7桁または8桁で入力してください");
	return;
}


if (isNaN(lineWidth) || isNaN(barcodeHeight) || lineWidth <= 0 || barcodeHeight <= 0) {
	alert("線幅やバーコードの高さを正しく入力してください");
	return;
}





// JANの種類を決定する
var janKind; // "JAN-13" or "JAN-8"

if (jan.length === 12 || jan.length === 13) {
	janKind = "JAN-13";
}

if (jan.length === 7 || jan.length === 8) {
	janKind = "JAN-8";
}



// JANの各桁を配列に格納する
var digits = [];

for (var i = 0; i < jan.length; i++) {
	digits[i] = parseInt(jan.charAt(i), 10);
}


// 各JANの規格上の桁数を変数にする
var specificationalJanLength;

if (janKind === "JAN-13"){
	specificationalJanLength = 13;
}
if (janKind === "JAN-8"){
	specificationalJanLength = 8;
}


// チェックディジットを、1〜12桁目の数字(JAN-13)、または1〜7桁目の数字(JAN-8)で求める
var sum = 0;
var tempDigits = digits.slice(0, specificationalJanLength - 1);
var reverseDigits = tempDigits.reverse();

for (var i = 0; i < reverseDigits.length; i++) {
    sum += (i % 2 === 0) ? reverseDigits[i] * 3 : reverseDigits[i] * 1;
}

var checkDigit = (10 - (sum % 10)) % 10;


// 入力されたJANコードにチェックディジットが無い場合は、先に計算したチェックディジットを追加する。文字列janもチェックディジットを追加しておく。
if (digits.length === (specificationalJanLength - 1)) {
	digits[specificationalJanLength - 1] = checkDigit;
	jan = jan + checkDigit;
}


// 入力されたJANコードにチェックディジットが有る場合は、チェックディジットが正しいか検証する
if (digits.length === specificationalJanLength) {
	if (digits[specificationalJanLength - 1] !== checkDigit) {
		alert("チェックディジットが正しくありません");
		return;
	}
}






// JANの各数字の4分割比率
var ratio = [];
ratio[0] = [3,2,1,1];
ratio[1] = [2,2,2,1];
ratio[2] = [2,1,2,2];
ratio[3] = [1,4,1,1];
ratio[4] = [1,1,3,2];
ratio[5] = [1,2,3,1];
ratio[6] = [1,1,1,4];
ratio[7] = [1,3,1,2];
ratio[8] = [1,2,1,3];
ratio[9] = [3,1,1,2];

// 4分割比率の逆順も定義する
var reverseRatio = [];
for (var j = 0; j < 10; j++) {
	reverseRatio[j] = [ratio[j][3],ratio[j][2],ratio[j][1],ratio[j][0]];
}




// JANの左1桁めの数字で決定される、左データ6文字分(左2桁目から左7桁目まで)のパリティの偶奇
// 0が偶数、1が奇数
var oddEven = [];

oddEven[0] = [1,1,1,1,1,1];
oddEven[1] = [1,1,0,1,0,0];
oddEven[2] = [1,1,0,0,1,0];
oddEven[3] = [1,1,0,0,0,1];
oddEven[4] = [1,0,1,1,0,0];
oddEven[5] = [1,0,0,1,1,0];
oddEven[6] = [1,0,0,0,1,1];
oddEven[7] = [1,0,1,0,1,0];
oddEven[8] = [1,0,1,0,0,1];
oddEven[9] = [1,0,0,1,0,1];






// ドキュメント取得
var doc;
if (app.documents.length === 0) {
	doc = app.documents.add();
} else {
	doc = app.activeDocument;
}

// グループ化に対応させる
var barcodeGroup = doc.groupItems.add();
barcodeGroup.name = "JAN_Barcode";

// バーをまとめておくサブグループを作る
var barGroup = barcodeGroup.groupItems.add();
barGroup.name = "Bars";







// バーの塗り色を設定する
var barColorDef = (typeof customBarColorDef !== 'undefined') ? customBarColorDef : defaultBarColorDef;  // カスタム設定がある場合のみそれを使う。無い時はデフォルト設定を使う
var barColor = createColor(doc, barColorDef);

// 数字の塗り色を設定する
var numberColorDef = (typeof customNumberColorDef !== 'undefined') ? customNumberColorDef : defaultNumberColorDef;  // カスタム設定がある場合のみそれを使う。無い時はデフォルト設定を使う
var numberColor = createColor(doc, numberColorDef);

// 背景の塗り色を設定する
var backgroundColorDef = (typeof customBackgroundColorDef !== 'undefined') ? customBackgroundColorDef : defaultBackgroundColorDef;  // カスタム設定がある場合のみそれを使う。無い時はデフォルト設定を使う
var backgroundColor = createColor(doc, backgroundColorDef);






// x座標
var xPosition = 0;



// 背景を作る
createBackground(doc, barcodeGroup, lineWidth, xPosition, barcodeHeight, additionalHeight, numberMode, janKind, backgroundColor);


// 左のマージンを決める
if (janKind === "JAN-13"){xPosition = 11 * lineWidth;}
if (janKind === "JAN-8"){xPosition = 7 * lineWidth;}


// 左のガードバーを作る
createGuardBar(doc, barGroup, lineWidth, xPosition, barcodeHeight, additionalHeight, barColor);
xPosition = xPosition + (3 * lineWidth);


// 左2桁目から7桁目までのセグメントを作る（JAN-13の場合）
// 左1桁目から4桁目までのセグメントを作る（JAN-8の場合）

var startDigit;
var endDigit;

if (janKind === "JAN-13"){
	startDigit = 1;
	endDigit = 6;
}

if (janKind === "JAN-8"){
	startDigit = 0;
	endDigit = 3;
}

for (var digitNumber = startDigit; digitNumber <= endDigit; digitNumber++) {
	createBarcodeSegment(doc, barGroup, digitNumber, digits, janKind, ratio, reverseRatio, oddEven, lineWidth, xPosition, barcodeHeight, barColor);
	xPosition = xPosition + (7 * lineWidth);
}


// センターバーを作る
createCenterBar(doc, barGroup, lineWidth, xPosition, barcodeHeight, additionalHeight, barColor);
xPosition = xPosition + (5 * lineWidth);


// 左8桁目から13桁目までのセグメントを作る（JAN-13の場合）
// 左4桁目から7桁目までのセグメントを作る（JAN-8の場合）

var startDigit2;
var endDigit2;

if (janKind === "JAN-13"){
	startDigit2 = 7;
	endDigit2 = 12;
}

if (janKind === "JAN-8"){
	startDigit2 = 4;
	endDigit2 = 7;
}

for (var digitNumber2 = startDigit2; digitNumber2 <= endDigit2; digitNumber2++) {
	createBarcodeSegment(doc, barGroup, digitNumber2, digits, janKind, ratio, reverseRatio, oddEven, lineWidth, xPosition, barcodeHeight, barColor);
	xPosition = xPosition + (7 * lineWidth);
}


// 右のガードバーを作る
createGuardBar(doc, barGroup, lineWidth, xPosition, barcodeHeight, additionalHeight, barColor);


// JANの数字を作る
if (numberMode  === "text" || numberMode  === "outline") {
	
	// JANの数字をまとめるためにサブグループを作る
	var numberGroup = barcodeGroup.groupItems.add();
	numberGroup.name = "Numbers";
	
	createBarcodeText(doc, numberGroup, lineWidth, barcodeHeight, numberColor, digits, janKind, customFontName);
}


// 数字をアウトライン化する（指定された場合）
if (numberMode === "outline") {
	
	while (numberGroup.textFrames.length > 0) {
		
		// グループ内からテキストを１つずつ取り出す
		var tf = numberGroup.textFrames[0];
		
		// テキストをアウトライン化する
		tf.createOutline();
		
	}
	
}




// 表示領域の中央にバーコードを移動させる
moveGroupToViewCenter(doc, barcodeGroup);


// main()の終わり
}
















// バーコードの描画に使う色をドキュメントのカラーモードに合わせて設定する
function createColor(doc, colorDef) {
	var targetColor;
	
	// colorDef に従って色を設定する
	// もし colorDef が未定義の場合はドキュメントのカラーモードを読み込んで、
	// CMYKドキュメントでは K100% の黒、RGBドキュメントでは RGB(0,0,0) を使用する
	if (colorDef && doc.documentColorSpace === DocumentColorSpace.CMYK) {
		targetColor = new CMYKColor();
		targetColor.cyan    = (colorDef.c !== undefined) ? colorDef.c : 0;
		targetColor.magenta = (colorDef.m !== undefined) ? colorDef.m : 0;
		targetColor.yellow  = (colorDef.y !== undefined) ? colorDef.y : 0;
		targetColor.black   = (colorDef.k !== undefined) ? colorDef.k : 100;
	 } else if (colorDef && doc.documentColorSpace === DocumentColorSpace.RGB) {
		targetColor = new RGBColor();
		targetColor.red   = (colorDef.r !== undefined) ? colorDef.r : 0;
		targetColor.green = (colorDef.g !== undefined) ? colorDef.g : 0;
		targetColor.blue  = (colorDef.b !== undefined) ? colorDef.b : 0;
	} else if (!colorDef) {
		if (doc.documentColorSpace === DocumentColorSpace.CMYK) {
			targetColor = new CMYKColor();
			targetColor.cyan    = 0;
			targetColor.magenta = 0;
			targetColor.yellow  = 0;
			targetColor.black   = 100;
		} else {
			targetColor = new RGBColor();
			targetColor.red   = 0;
			targetColor.green = 0;
			targetColor.blue  = 0;
		}
	}
	
	return targetColor;
}




// 背景を描画する
function createBackground(doc, barcodeGroup, lineWidth, xPosition, barcodeHeight, additionalHeight, numberMode, janKind, backgroundColor){
	
	var modules;
	if (janKind === "JAN-13"){modules = 113;}
	if (janKind === "JAN-8"){modules = 81;}
	
	var backgroundHeight;
	if (numberMode  === "text" || numberMode  === "outline") {
		backgroundHeight = barcodeHeight + 12 * lineWidth;
	} else if (numberMode  === "none") {
		backgroundHeight = barcodeHeight + 5 * lineWidth * additionalHeight;
	}
	
	var rect1 = doc.pathItems.rectangle(
		0, // top
		xPosition, // left
		(modules * lineWidth), // width
		backgroundHeight // height
		);
		
		rect1.filled = true;
		rect1.fillColor = backgroundColor;
		rect1.stroked = false;
		
		// グループに追加
		rect1.move(barcodeGroup, ElementPlacement.PLACEATEND);

}



// ガードバーを描画する
function createGuardBar(doc, barGroup, lineWidth, xPosition, barcodeHeight, additionalHeight, barColor) {
	
	var rect1 = doc.pathItems.rectangle(
		0, // top
		xPosition, // left
		lineWidth, // width
		(barcodeHeight + 5 * lineWidth * additionalHeight) // height
		);
		
		rect1.filled = true;
		rect1.fillColor = barColor;
		rect1.stroked = false;
		
		// グループに追加
		rect1.move(barGroup, ElementPlacement.PLACEATEND);
	
	xPosition = xPosition + 2 * lineWidth;
	
	var rect2 = doc.pathItems.rectangle(
		0, // top
		xPosition, // left
		lineWidth, // width
		(barcodeHeight + 5 * lineWidth * additionalHeight) // height
		);
		
		rect2.filled = true;
		rect2.fillColor = barColor;
		rect2.stroked = false;
		
		// グループに追加
		rect2.move(barGroup, ElementPlacement.PLACEATEND);
	
}



// JANコードの各数字をバーで表現(描画)する
function createBarcodeSegment(doc, barGroup, digitNumber, digits, janKind, ratio, reverseRatio, oddEven, lineWidth, xPosition, barcodeHeight, barColor) {
	
	
	var leftDataCharacter = false;
	var rightDataCharacter = false;
	
	var ratioOfThisSegment = [];
	
	// JAN-13で左2桁目から7桁目までのセグメントの場合
	if (janKind === "JAN-13" && digitNumber >= 1 && digitNumber <= 6) {
		leftDataCharacter = true;
	}
	
	// JAN-8で左1桁目から4桁目までのセグメントの場合
	if (janKind === "JAN-8" && digitNumber >= 0 && digitNumber <= 3) {
		leftDataCharacter = true;
	}
		
	// JAN-13で左8桁目から13桁目までのセグメントの場合
	if (janKind === "JAN-13" && digitNumber >= 7 && digitNumber <= 12){
		rightDataCharacter = true;
	}
	
	// JAN-8で左5桁目から8桁目までのセグメントの場合
	if (janKind === "JAN-8" && digitNumber >= 4 && digitNumber <= 7){
		rightDataCharacter = true;
	}
	
	
	// 左データキャラクタの描画
	if (leftDataCharacter){
		// JAN-13の場合のみ
		if (janKind === "JAN-13"){
			// JANコードの左1桁目の数字から、その桁のパリティの偶奇を求める(0が偶、1が奇)
			var oddOrEven = oddEven[digits[0]][digitNumber-1];
			
			if (oddOrEven == 0) {
				ratioOfThisSegment = reverseRatio[digits[digitNumber]];
			} else {
				ratioOfThisSegment = ratio[digits[digitNumber]];
			}
		}
		
		// JAN-8の場合
		if (janKind === "JAN-8"){
			ratioOfThisSegment = ratio[digits[digitNumber]];
		}
		
		
		// 描画
		xPosition = xPosition + (ratioOfThisSegment[0] * lineWidth);
		
		var rect1 = doc.pathItems.rectangle(
			0, // top
			xPosition, // left
			(ratioOfThisSegment[1] * lineWidth), // width
			barcodeHeight // height
		);

		rect1.filled = true;
		rect1.fillColor = barColor;
		rect1.stroked = false;
		
		// グループに追加
		rect1.move(barGroup, ElementPlacement.PLACEATEND);
		
		
		xPosition = xPosition + (ratioOfThisSegment[1] * lineWidth);
		xPosition = xPosition + (ratioOfThisSegment[2] * lineWidth);
		
		
		var rect2 = doc.pathItems.rectangle(
			0, // top
			xPosition, // left
			(ratioOfThisSegment[3] * lineWidth), // width
			barcodeHeight // height
		);
		
		rect2.filled = true;
		rect2.fillColor = barColor;
		rect2.stroked = false;
		
		// グループに追加
		rect2.move(barGroup, ElementPlacement.PLACEATEND);
		
	} 
	
	
	// 右データキャラクタの描画
	if (rightDataCharacter){
		
		// JAN-13もJAN-8も同じ処理
		ratioOfThisSegment = ratio[digits[digitNumber]];
		
		// 描画
		var rect1 = doc.pathItems.rectangle(
			0, // top
			xPosition, // left
			(ratioOfThisSegment[0] * lineWidth), // width
			barcodeHeight // height
		);
		
		rect1.filled = true;
		rect1.fillColor = barColor;
		rect1.stroked = false;
		
		// グループに追加
		rect1.move(barGroup, ElementPlacement.PLACEATEND);
		
		
		xPosition = xPosition + (ratioOfThisSegment[0] * lineWidth);
		xPosition = xPosition + (ratioOfThisSegment[1] * lineWidth);
		
		
		var rect2 = doc.pathItems.rectangle(
			0, // top
			xPosition, // left
			(ratioOfThisSegment[2] * lineWidth), // width
			barcodeHeight // height
		);
		
		rect2.filled = true;
		rect2.fillColor = barColor;
		rect2.stroked = false;
		
		// グループに追加
		rect2.move(barGroup, ElementPlacement.PLACEATEND);
		
	}  
}





// センターバーを描画
function createCenterBar(doc, barGroup, lineWidth, xPosition, barcodeHeight, additionalHeight, barColor){
	
	xPosition = xPosition + lineWidth;		
		
	var rect1 = doc.pathItems.rectangle(
		0, // top
		xPosition, // left
		lineWidth, // width
		(barcodeHeight + 5 * lineWidth * additionalHeight) // height
		);
		
		rect1.filled = true;
		rect1.fillColor = barColor;
		rect1.stroked = false;
		
		// グループに追加
		rect1.move(barGroup, ElementPlacement.PLACEATEND);
		
		
	xPosition = xPosition + (2 * lineWidth);		
		
		
	var rect2 = doc.pathItems.rectangle(
		0, // top
		xPosition, // left
		lineWidth, // width
		(barcodeHeight + 5 * lineWidth * additionalHeight) // height
		);
		
		rect2.filled = true;
		rect2.fillColor = barColor;
		rect2.stroked = false;
		
		// グループに追加
		rect2.move(barGroup, ElementPlacement.PLACEATEND);
	
	
}






// JANの数字を描画する
function createBarcodeText(doc, numberGroup, lineWidth, barcodeHeight, numberColor, digits, janKind, customFontName) {
	
	var x;
	
	// 左側マージンを設定する
	if (janKind === "JAN-13"){x = 2 * lineWidth;}
	if (janKind === "JAN-8"){x = 10 * lineWidth;}
	
	
	
	
	// フォント取得
	var barcodeFont = getBarcodeFont(doc, customFontName);
	
	
	var tf = [];
	
	
	for (var j = 0; j < digits.length; j++) {
	 
		tf[j] = doc.textFrames.add();
		
		tf[j].contents = digits[j];
		
		// フォント
		if (barcodeFont) {
			tf[j].textRange.characterAttributes.textFont = barcodeFont;
		}
		
		// フォントサイズ
		tf[j].textRange.characterAttributes.size = (7 * lineWidth);
		
		// 色
		tf[j].textRange.characterAttributes.fillColor = numberColor;
		
		
		tf[j].left = x + (7 * lineWidth) / 2;
		// 各セグメントの下でテキストを中央揃えにする
		tf[j].paragraphs[0].justification = Justification.CENTER;

		tf[j].top = -1 * (barcodeHeight + 1 * lineWidth);
		
		
		
		// 次の文字のために、座標を1文字分だけ右にずらす
		x = x + (7 * lineWidth);
		
		// JAN-13の場合、次の文字のために、座標をガードバーの分だけ右にずらす
		if (janKind === "JAN-13"){
			if (j == 0){
				x = x + (5 * lineWidth);
			}
		}
		
	
		
		
		var lastDigitOfLeftDataCharacter;
		if (janKind === "JAN-13"){lastDigitOfLeftDataCharacter = 6;}
		if (janKind === "JAN-8"){lastDigitOfLeftDataCharacter = 3;}

		// センターバーの分だけ右にずらす
		if (j == lastDigitOfLeftDataCharacter){
			x = x + (5 * lineWidth);
		}
				
		
		// グループに入れる
		tf[j].move(numberGroup, ElementPlacement.PLACEATEND);
	}
	
}





// フォントを設定
function getBarcodeFont(doc, customFontName) {
	var font;
	
	
	// 上のフォントから優先して使用
	// 配列の一番最後には「,」をつけないこと
	var candidateFonts = [
		"OCRB",
		"OCR-B",
		"OCRBStd"
	];
	//  "OCRBStd" → Adobe Fonts
	
	
	if (customFontName !== "") {
		// candidateFonts配列の最初に追加
		candidateFonts.unshift(customFontName);
	}
	
	
	// candidateFontsを最初から読み込んで、存在するフォントであれば即returnして終わる
	for (var i = 0; i < candidateFonts.length; i++) {
		try {
			return app.textFonts.getByName(candidateFonts[i]);
		} catch (e) {
		}
	}
	
	return font;
}






// 表示中ウインドウの中央(アートボードの中央ではない)にバーコードのグループを移動させる
function moveGroupToViewCenter(doc, barcodeGroup) {
	
	var view = doc.activeView;  // 現在の表示ビュー	
	var vb = view.bounds;  // 表示中の可視範囲
	// viewについて、ドキュメントからの「左・上・右・下」の距離を取得
	// [left, top, right, bottom]
	
	var viewCenterX = (vb[0] + vb[2]) / 2;
	var viewCenterY = (vb[1] + vb[3]) / 2;
	
	var gb = barcodeGroup.visibleBounds;
	// barcodeGroupについて、ドキュメントからの「左・上・右・下」の距離を取得
	// [left, top, right, bottom]
	
	var barcodeCenterX = (gb[0] + gb[2]) / 2;
	var barcodeCenterY = (gb[1] + gb[3]) / 2;
	
	
	var dx = viewCenterX - barcodeCenterX;
	var dy = viewCenterY - barcodeCenterY;
	
	barcodeGroup.translate(dx, dy);
}






