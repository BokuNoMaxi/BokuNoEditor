<?php
include('Konstanten.php');
function createRTFFile($RTFCode){
    $filename=RandomString(6).'.rtf';
    $file='../FileOutput/'. $filename;
    $RTF= fopen($file, 'w',1);
    fwrite($RTF, $RTFCode);
    fclose($RTF);
    return(array('Status'=>0,'Ergebnis'=>$filename));
}
//Umrechnungen
function Pixel2Point($Pixel){
    return intval(round(str_replace('px', '', $Pixel)*0.75));
}
function Pixel2Twips($Pixel){
    return intval(round(str_replace('px', '', $Pixel)*15));
}
function Point2Pixel($Point){
    return intval(round($Point/0.75));
}
function Twips2Pixel($Twips){
    return intval(round($Twips/15));
}
//schlüssle CSS RGB auf und gib es als Array zurück
function colorHTMLtoRGBArr($HTML){
    $HTML=explode(',',substr($HTML, strpos($HTML, '(')+1,-1));
    if(count($HTML)===3){
        return array('red'=>intval($HTML[0]),'green'=>intval($HTML[1]),'blue'=>intval($HTML[2]));
    }else{
        return array('red'=>0,'green'=>0,'blue'=>0);
    }
}
function SonderzeichenWandler($format,$zeichenkette){
    switch ($format){
        case 'HTML'://Konvertiere HTML Chars zu RTF Chars
            $zeichenkette= str_replace('ä', Sonderzeichen2RTF['ä'], $zeichenkette);
            $zeichenkette= str_replace('ö', Sonderzeichen2RTF['ö'], $zeichenkette);
            $zeichenkette= str_replace('ü', Sonderzeichen2RTF['ü'], $zeichenkette);
            $zeichenkette= str_replace('Ä', Sonderzeichen2RTF['Ä'], $zeichenkette);
            $zeichenkette= str_replace('Ö', Sonderzeichen2RTF['Ö'], $zeichenkette);
            $zeichenkette= str_replace('Ü', Sonderzeichen2RTF['Ü'], $zeichenkette);
            $zeichenkette= str_replace('ß', Sonderzeichen2RTF['ß'], $zeichenkette);
            break;
    }
    return $zeichenkette;
}

function RandomString($length = 32) {
    $randstr="";
    $chars = array(
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'p',
        'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5',
        '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 
        'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');

    for ($rand = 0; $rand <= $length; $rand++) {
        $randstr .= $chars[rand(0, count($chars) - 1)];
    }
    return $randstr;
}