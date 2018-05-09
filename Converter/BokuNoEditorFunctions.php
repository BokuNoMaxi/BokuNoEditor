<?php
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
