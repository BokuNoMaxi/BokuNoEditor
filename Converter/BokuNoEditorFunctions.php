<?php
include('Konstanten.php');
function createRTFFile($RTFCode){
    $RTF= fopen('../FileOutput/Test.rtf', 'w');
    fwrite($RTF, $RTFCode);
    fclose($RTF);
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
