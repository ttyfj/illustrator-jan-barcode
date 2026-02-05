// This script is public domain.
// Created by Tatsuya Fujii.
// https://blue.mints.ne.jp/jan/
// version 7
// Released Jan 7, 2026



main();

// 必要に応じて処理をreturn;で止めるため、全体を関数main()で包む
function main() {


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

// バーをサブグループにする
var barGroup = barcodeGroup.groupItems.add();
barGroup.name = "Bars";

// JANの数字をサブグループにする
var numberGroup = barcodeGroup.groupItems.add();
numberGroup.name = "Numbers";



// ダイアログ
var dlg = new Window("dialog", "バーコードの設定");

dlg.add("statictext", undefined, "JAN-13またはJAN-8");
var janInput = dlg.add("edittext", undefined, "");
janInput.characters = 13;

dlg.add("statictext", undefined, "線幅 (pt)");
var widthInput = dlg.add("edittext", undefined, "1");
widthInput.characters = 10;

dlg.add("statictext", undefined, "バーコードの高さ (pt)");
var heightInput = dlg.add("edittext", undefined, "65");
heightInput.characters = 10;

var outlineCheck = dlg.add("checkbox", undefined, "数字をアウトライン化する");
outlineCheck.value = false; // デフォルトOFF

var btns = dlg.add("group");
btns.alignment = "right";
btns.add("button", undefined, "キャンセル", {name:"cancel"});  // {name:"cancel"} のボタンが押されると dlg.show() の戻り値は 2 になる（仕様）
btns.add("button", undefined, "OK", {name:"ok"});  // {name:"ok"} のボタンが押されると dlg.show() の戻り値は 1 になる（仕様）



if (dlg.show() != 1) return;


// 数値化
var jan = janInput.text;
var lineWidth = Number(widthInput.text);
var barcodeHeight = Number(heightInput.text);
var shouldOutlineNumbers = outlineCheck.value;


// 入力されたデータの検証
if (!/^(?:\d{7,8}|\d{12,13})$/.test(jan)) {
	alert("JANコードは、JAN-13では12桁または13桁で、JAN-8では7桁または8桁で入力してください");
	return;
}


if (lineWidth<=0 || barcodeHeight<=0) {
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
// チェックディジット計算時の重み(weight)も変数にする
var specificationalJanLength;
var weight = [];

if (janKind === "JAN-13"){
	specificationalJanLength = 13;
	weight = [1,3];
}
if (janKind === "JAN-8"){
	specificationalJanLength = 8;
	weight = [3,1];
}


// チェックディジットを、1〜12桁目の数字(JAN-13)、または1〜7桁目の数字(JAN-8)で求める
var sum = 0;

for (var i = 0; i < (specificationalJanLength - 1); i++) {
	if (i % 2 === 0) {
		// 偶数 index（1桁目,3桁目...）
		sum += digits[i] * weight[0];
	} else {
		// 奇数 index（2桁目,4桁目...）
		sum += digits[i] * weight[1];
	}
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




// 塗り色を黒色に設定する
var customColor = createBlackColor(doc);



// x座標
var xPosition = 0;



// 背景を作る
createBackground(doc, barcodeGroup, lineWidth, xPosition, barcodeHeight, janKind);

// 左のマージンを決める(規格上、11線分のスペースが必要)
xPosition = 11 * lineWidth;


// 左のガードバーを作る
createGuardBar(doc, barGroup, lineWidth, xPosition, barcodeHeight, customColor);
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
	createBarcodeSegment(doc, barGroup, digitNumber, digits, janKind, ratio, reverseRatio, oddEven, lineWidth, xPosition, barcodeHeight, customColor);
	xPosition = xPosition + (7 * lineWidth);
}


// センターバーを作る
createCenterBar(doc, barGroup, lineWidth, xPosition, barcodeHeight, customColor);
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
	createBarcodeSegment(doc, barGroup, digitNumber2, digits, janKind, ratio, reverseRatio, oddEven, lineWidth, xPosition, barcodeHeight, customColor);
	xPosition = xPosition + (7 * lineWidth);
}


// 右のガードバーを作る
createGuardBar(doc, barGroup, lineWidth, xPosition, barcodeHeight, customColor);


// JANの数字を作る
createBarcodeText(doc, numberGroup, lineWidth, barcodeHeight, customColor, digits, janKind);


// 数字をアウトライン化（オプションとして指定された場合）
if (shouldOutlineNumbers) {
	
	// アウトライン化されたデータをまとめるグループを作る
	var outlinedNumberGroup = barcodeGroup.groupItems.add();
	outlinedNumberGroup.name = "Numbers_Outlined";
	
	// アウトライン化を実行
	outlineNumberGroup(numberGroup, outlinedNumberGroup, customColor);
}


// 数字をアウトライン化した場合、空になった元の数字グループを削除
if (shouldOutlineNumbers && numberGroup.pageItems.length === 0) {
    numberGroup.remove();
}


// 表示領域の中央にバーコードを移動させる
moveGroupToViewCenter(doc, barcodeGroup);


// main()の終わり
}











// バーコードの描画に使う黒色をドキュメントのカラーモードに合わせて設定する
// CMYKドキュメントでは K100% の黒、RGBドキュメントでは RGB(0,0,0) を使用する
function createBlackColor(doc) {
	var black;
	
	if (doc.documentColorSpace === DocumentColorSpace.CMYK) {
		black = new CMYKColor();
		black.cyan    = 0;
		black.magenta = 0;
		black.yellow  = 0;
		black.black   = 100;
	} else {
		black = new RGBColor();
		black.red   = 0;
		black.green = 0;
		black.blue  = 0;
	}
	
	return black;
}




// 背景を描画する
function createBackground(doc, barcodeGroup, lineWidth, xPosition, barcodeHeight, janKind){
	
	var modules;
	if (janKind === "JAN-13"){modules = 113;}
	if (janKind === "JAN-8"){modules = 85;}
	
	var rect1 = doc.pathItems.rectangle(
		0, // top
		xPosition, // left
		(modules * lineWidth), // width
		(barcodeHeight + 12 * lineWidth) // height
		);
		
		rect1.filled = false;
		rect1.stroked = false;
		
		// グループに追加
		rect1.move(barcodeGroup, ElementPlacement.PLACEATEND);

}



// ガードバーを描画する
function createGuardBar(doc, barGroup, lineWidth, xPosition, barcodeHeight, customColor) {
	
	var rect1 = doc.pathItems.rectangle(
		0, // top
		xPosition, // left
		lineWidth, // width
		(barcodeHeight + 5 * lineWidth) // height
		);
		
		rect1.filled = true;
		rect1.fillColor = customColor;
		rect1.stroked = false;
		
		// グループに追加
		rect1.move(barGroup, ElementPlacement.PLACEATEND);
	
	xPosition = xPosition + 2 * lineWidth;		
	
	var rect2 = doc.pathItems.rectangle(
		0, // top
		xPosition, // left
		lineWidth, // width
		(barcodeHeight + 5 * lineWidth) // height
		);
		
		rect2.filled = true;
		rect2.fillColor = customColor;
		rect2.stroked = false;
		
		// グループに追加
		rect2.move(barGroup, ElementPlacement.PLACEATEND);
	
}



// JANコードの各数字をバーで表現(描画)する
function createBarcodeSegment(doc, barGroup, digitNumber, digits, janKind, ratio, reverseRatio, oddEven, lineWidth, xPosition, barcodeHeight, customColor) {
	
	
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
		rect1.fillColor = customColor;
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
		rect2.fillColor = customColor;
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
		rect1.fillColor = customColor;
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
		rect2.fillColor = customColor;
		rect2.stroked = false;
		
		// グループに追加
		rect2.move(barGroup, ElementPlacement.PLACEATEND);
		
	}  
}





// センターバーを描画
function createCenterBar(doc, barGroup, lineWidth, xPosition, barcodeHeight, customColor){
	
	xPosition = xPosition + lineWidth;		
		
	var rect1 = doc.pathItems.rectangle(
		0, // top
		xPosition, // left
		lineWidth, // width
		(barcodeHeight + 5 * lineWidth) // height
		);
		
		rect1.filled = true;
		rect1.fillColor = customColor;
		rect1.stroked = false;
		
		// グループに追加
		rect1.move(barGroup, ElementPlacement.PLACEATEND);
		
		
	xPosition = xPosition + (2 * lineWidth);		
		
		
	var rect2 = doc.pathItems.rectangle(
		0, // top
		xPosition, // left
		lineWidth, // width
		(barcodeHeight + 5 * lineWidth) // height
		);
		
		rect2.filled = true;
		rect2.fillColor = customColor;
		rect2.stroked = false;
		
		// グループに追加
		rect2.move(barGroup, ElementPlacement.PLACEATEND);
	
	
}






// JANの数字を描画する
function createBarcodeText(doc, numberGroup, lineWidth, barcodeHeight, customColor, digits, janKind) {
	
	var x;
	
	// 左側マージンを設定する
	if (janKind === "JAN-13"){x = 2 * lineWidth;}
	if (janKind === "JAN-8"){x = 14 * lineWidth;}
	
	var tf = [];
	
	var baselineOffset = 10.56;
	// Illustratorの textFrame では、テキストのベースラインがY座標 0 から一定量ズレる
	// その補正値をbaselineOffsetに代入しておく
	// 「baselineOffset = 10.56」が推奨（実測して求めた数値）
	// この値はフォントサイズには依存しない
	
	// フォント取得
	var barcodeFont = getBarcodeFont(doc);
	
	
	for (var j = 0; j < digits.length; j++) {
	 
		tf[j] = doc.textFrames.add();
		
		tf[j].contents = digits[j];
		
		// 各セグメントの下でテキストを中央揃えにする
		tf[j].left = x + (7 * lineWidth) / 2;
		tf[j].paragraphs[0].justification = Justification.CENTER;
		
		tf[j].top  = -1 * (barcodeHeight + 7 * lineWidth) + baselineOffset;
		
		
		
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
		
		
		// フォント
		if (barcodeFont) {
			tf[j].textRange.characterAttributes.textFont = barcodeFont;
		}
		
		// フォントサイズ
		tf[j].textRange.characterAttributes.size = (7 * lineWidth);
		
		// 色
		tf[j].textRange.characterAttributes.fillColor = customColor;
		
		
		// グループに入れる
		tf[j].move(numberGroup, ElementPlacement.PLACEATEND);
	}
	
}





// フォントを設定
function getBarcodeFont(doc) {
	var font;
	
	
	
	// 数字の表記に使うフォントを配列としてここに追加します
	// 上のフォントから優先して使用されます
	// PostScript名で記述します
	// 配列の一番最後には「,」をつけないこと
	var candidateFonts = [
		"OCRB",
		"OCR-B",
		"OCRBStd"
	];
	//  "OCRBStd" → Adobe Fonts
	
	
	
	for (var i = 0; i < candidateFonts.length; i++) {
		try {
			return app.textFonts.getByName(candidateFonts[i]);
		} catch (e) {
		}
	}
	
	// candidateFontsに一致するフォントが無い場合、一時テキストを作成して、それよりフォントを取得
	var tf = doc.textFrames.add();
	tf.contents = "0";

	font = tf.textRange.characterAttributes.textFont;

	tf.remove(); // 一時テキストを削除

	return font;
}





function outlineNumberGroup(numberGroup, outlinedNumberGroup, customColor) {
	
	// numberGroup内のtextFramesが無くなるまで処理
	// テキストをアウトライン化すると、もはやテキスト形式ではなくなるため、
	// numberGroup.textFrames には含まれなくなる
	while (numberGroup.textFrames.length > 0) {
	
		var tf = numberGroup.textFrames[0];
		
		// アウトライン化（戻り値は配列になる）
		var outlines = tf.createOutline();

		// アウトライン化したものを outlinedNumberGroup に移動
		// 文字によっては複数のパスができるので、outlinesは配列になっている
		// よって配列の中身を取り出してからじゃないと、色の変更や、outlinedNumberGroupへの移動はできない
		for (var i = 0; i < outlines.length; i++) {
			// createOutline() により色は引き継がれるが、
			// 将来の仕様変更や可読性のため明示的に色を設定しておく
			outlines[i].fillColor = customColor;
			outlines[i].stroked = false;
			
			outlines[i].move(outlinedNumberGroup, ElementPlacement.PLACEATEND);
		}
	}
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






