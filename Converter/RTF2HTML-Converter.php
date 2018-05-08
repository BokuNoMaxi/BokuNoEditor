<?php
include('Konstanten.php');
include('BokuNoEditorFunctions.php');
$RTF = file_get_contents('../FileImport/'.$_POST['RTF']);//schreibe Inhalt des Dokuments in ein File
//Strip Problematisches
$RTF = str_replace('\fnil', '', $RTF);
$RTF = str_replace('\fcharset0', '', $RTF);
$RTF = str_replace('\fcharset2', '', $RTF);
$RTF = str_replace('\fcharset128', '', $RTF);
$RTF = str_replace('\fswiss', '', $RTF);
$RTF = str_replace('\froman', '', $RTF);
$RTF = str_replace('\fprq0', '', $RTF);
$RTF = str_replace('\fprq2', '', $RTF);

$Befehle= explode('\\', $RTF);//splitte das Dokument bei jedem \ 
$OutputHTML="";//Das wird unsere Ausgabe;
$ParagraphStyles=ParagraphStartTag." style='";$ParagraphContent="";//Dies ist der jeweilige Paragraph unserer Ausgabe;
$tableActive=false;$TDContentOutput;$TDContent="";$TRStyles="";$TableActiveBorder="";$TDStylings=array();$TDActiveStylings="";$TableFontSet=false;$TDBreite=array();$TableBreite=0;$TDAktiv=0;//Tabellenstyling
$deffMode=false;//DefinitionsModus An/Aus;
$GroupCounter=0;$deffStart=0;$Schriftarten=array();
$fontSet=false;//ob schon eine Schrift gesetzt wurde
foreach($Befehle as $B){
    $Mixed=false;$Befehl=$B;$Content="";$Wert=-1;//Setze Defaultvariablen
    //Sonderzeichen
    if(strpos($Befehl,"'")!==false){
        $Content=substr($Befehl,3);
        $Befehl=substr($Befehl,1,2);
        
        $ParagraphContent.=utf8_encode(chr(hexdec($Befehl))).$Content;
        continue;
    }
    //Wenn ein Leerzeichen/Enter vorhanden ist dann gibt es Content bei diesem Befehl
    if((strpos(trim($Befehl),' ')!==false||strpos(trim($Befehl),chr(13))!==false)&& strpos($Befehl, ';')===false){
        $firstSpace=strpos(trim($Befehl),' ');
        $firstEnter=strpos(trim($Befehl),chr(13));
        if($firstSpace===false){
            $Mixed=explode(chr(13), $Befehl, 2);
        }else if($firstEnter===false){
            $Mixed=explode(' ', $Befehl, 2);
        }else if($firstSpace<$firstEnter){
            $Mixed=$Mixed=explode(' ', $Befehl, 2);
        }
        
        $Befehl=$Mixed[0];
        $Content=$Mixed[1];
    }
    //wenn es einen Befehl gibt der durch eine Zahl definiert wird dann trenne sie
    if(preg_match("/[0-9]/", $Befehl, $BefehlMitWerten,PREG_OFFSET_CAPTURE)){
        $Wert= substr($Befehl, $BefehlMitWerten[0][1]);
        $Befehl= substr($Befehl, 0,$BefehlMitWerten[0][1]);
        if(strpos($Wert, ' ')){
            $Content= substr($Wert, strpos($Wert,' ')+1);
            $Wert= substr($Wert, 0, strpos($Wert,' '));
        }
    }
    //Definition was passiert wenn ein Gruppenzeichen gefunden wurde
    $anzGroup=0;$anzEndGroup=0;
    if(strpos($Befehl, '{')!==false||strpos($Content, '{')!==false|| strpos($Wert, '}')){
        $anzGroup=substr_count($Befehl,'{')+substr_count($Content,'{')+ substr_count($Wert, '{');
    }
    if(strpos($Befehl, '}')!==false||strpos($Content, '}')!==false|| strpos($Wert, '}')){
        $anzEndGroup=(-substr_count($Befehl,'}')-substr_count($Content,'}')-substr_count($Wert, '}'));
    }
    $GroupCounter=$GroupCounter+($anzGroup+$anzEndGroup);
    if($deffMode==true&&strpos($Befehl, '{')!==false&&$deffStart===0){
        $deffStart=$GroupCounter;
    }
    $Content= str_replace('}', '', $Content);
    switch (trim($Befehl)) {
        //Konfiguration
        case 'deff':
            $deffMode=true;
            break;
        case 'generator':
            break;
        //Paragraphformatierung
        case 'qr'://Rechtsbündig
            if($tableActive==true){
                $TDStylings[$TDAktiv]=$TDStylings[$TDAktiv].'text-align:right;';
                $TDContent.=$Content;
            }else{
                $ParagraphStyles.='text-align:right;';
                $ParagraphContent.=$Content;
            }
            break;
        case 'qc'://Zentriert
            if($tableActive==true){
                $TDStylings[$TDAktiv]=$TDStylings[$TDAktiv].'text-align:center;';
                $TDContent.=$Content;
            }else{
                $ParagraphStyles.='text-align:center;';
                $ParagraphContent.=$Content;
            }
            break;
        case 'ql'://Linkssbündig
            if($tableActive==true){
                $TDStylings[$TDAktiv]=$TDStylings[$TDAktiv].'text-align:left;';
                $TDContent.=$Content;
            }else{
                $ParagraphStyles.='text-align:left;';
                $ParagraphContent.=$Content;
            }
            break;
        case 'qj'://Linkssbündig
            if($tableActive==true){
                $TDStylings[$TDAktiv]=$TDStylings[$TDAktiv].'text-align:justify;';
                $TDContent.=$Content;
            }else{
                $ParagraphStyles.='text-align:justify;';
                $ParagraphContent.=$Content;
            }
            break;
        //Paragraph Contentformatierung
        case 'b'://Fett
            if($tableActive==true){
                if($Wert>=0) $TDContent.=$Content.'</b>';                
                else $TDContent.='<b>'.$Content;
            }else{
                if($Wert>=0) $ParagraphContent.=$Content.'</b>';                
                else $ParagraphContent.='<b>'.$Content;
            }
            break;
        case 'i'://Kursiv
            if($tableActive==true){
                if($Wert>=0) $TDContent.=$Content.'</i>'; 
                else $TDContent.='<i>'.$Content;
            }else{
                if($Wert>=0) $ParagraphContent.=$Content.'</i>'; 
                else $ParagraphContent.='<i>'.$Content;
            }
           
            break;
        case 'f'://Schriftart
            if($deffMode==true){
                $Schriftarten[$Befehl.$Wert]=substr($Content,0, strpos($Content, ';'));
            }else{
                if($tableActive==true){
                    if($TableFontSet==true)$TDContent.='</font>';
                    if($TableFontSet==false)$fontSet=true;
                    $TDContent.='<font face="'.$Schriftarten[$Befehl.$Wert].'">'.$Content;
                }else{
                    //zur Korrekteren Darstellung der Schriftarten ohne 1000 verschachtelungen
                    if($fontSet==true)$ParagraphContent.='</font>';
                    if($fontSet==false)$fontSet=true;

                    $ParagraphContent.='<font face="'.$Schriftarten[$Befehl.$Wert].'">'.$Content;//Setzen der Schriftart
                }
            }
            break;
        case 'fs'://Schriftgröße
            if($tableActive==true){
                $TDContent.='<span style="font-size:'.($Wert/2).'pt;">'.$Content;
            }else{
                $ParagraphContent.='<span style="font-size:'.($Wert/2).'pt;">'.$Content;
            }
            break;
        //Tabelle
        case 'trowd'://initialisiere Tabelle
            $tableActive=true;$TDContentOutput="";$TDContent="";$TRStyles="";$TableActiveBorder="";$TDAktiv=0;$TDBreite=array();$TableBreite=0;$TDStylings=array();$TDActiveStylings="";//setze alles wieder auf Standard
            break;
        case 'trbrdrl': //Rahmen der Zeile Links
            $TableActiveBorder='trbrdrl';
            break;
        case 'trbrdrt': //Rahmen der Zeile Oben
            $TableActiveBorder='trbrdrt';
            break;
        case 'trbrdrr': //Rahmen der Zeile Rechts
            $TableActiveBorder='trbrdrr';
            break;
        case 'trbrdrb': //Rahmen der Zeile Unten
            $TableActiveBorder='trbrdrb';
            break;
        case 'clbrdrl': //Rahmen der Zelle Links
            $TableActiveBorder='clbrdrl';
            break;
        case 'clbrdrt': //Rahmen der Zelle Oben
            $TableActiveBorder='clbrdrt';
            break;
        case 'clbrdrr': //Rahmen der Zelle Rechts
            $TableActiveBorder='clbrdrr';
            break;
        case 'clbrdrb': //Rahmen der Zelle Unten
            $TableActiveBorder='clbrdrb';
            break;
        case 'brdrs'://einfacher Rahmen
            switch ($TableActiveBorder) {
                case 'trbrdrl':
                    $TRStyles.='border-left-style:solid;';
                    break;
                case 'trbrdrr':
                    $TRStyles.='border-right-style:solid;';
                    break;
                case 'trbrdrt':
                    $TRStyles.='border-top-style:solid;';
                    break;
                case 'trbrdrb':
                    $TRStyles.='border-bottom-style:solid;';
                    break;
                case 'clbrdrb':
                    $TDActiveStylings.='border-bottom-style:solid;';
                    break;
                case 'clbrdrt':
                    $TDActiveStylings.='border-top-style:solid;';
                    break;
                case 'clbrdrr':
                    $TDActiveStylings.='border-right-style:solid;';
                    break;
                case 'clbrdrl':
                    $TDActiveStylings.='border-left-style:solid;';
                    break;
            }
            break;
        case 'brdrw'://Breite des Borders
            switch ($TableActiveBorder) {
                case 'trbrdrl':
                    $TRStyles.='border-left-width:'.Twips2Pixel($Wert).'px;';
                    break;
                case 'trbrdrr':
                    $TRStyles.='border-right-width:'.Twips2Pixel($Wert).'px;';
                    break;
                case 'trbrdrt':
                    $TRStyles.='border-top-width:'.Twips2Pixel($Wert).'px;';
                    break;
                case 'trbrdrb':
                    $TRStyles.='border-bottom-width:'.Twips2Pixel($Wert).'px;';
                    break;
                case 'clbrdrb':
                    $TDActiveStylings.='border-bottom-width:'.Twips2Pixel($Wert).'px;';
                    break;
                case 'clbrdrt':
                    $TDActiveStylings.='border-top-width:'.Twips2Pixel($Wert).'px;';
                    break;
                case 'clbrdrr':
                    $TDActiveStylings.='border-right-width:'.Twips2Pixel($Wert).'px;';
                    break;
                case 'clbrdrl':
                    $TDActiveStylings.='border-left-width:'.Twips2Pixel($Wert).'px;';
                    break;
            }
            break;
        case 'clpadt'://Padding der Zelle
            $TDActiveStylings.='padding-top:'.Twips2Pixel($Wert).';';
            break;
        case 'clpadl':
            $TDActiveStylings.='padding-top:'.Twips2Pixel($Wert).';';
            break;
        case 'clpadr':
            $TDActiveStylings.='padding-top:'.Twips2Pixel($Wert).';';
            break;
        case 'clpadb':
            $TDActiveStylings.='padding-top:'.Twips2Pixel($Wert).';';
            break;
        case 'clcbpat':
            break;
        case 'cellx':
            $TDBreite[]=Twips2Pixel($Wert);
            $TDStylings[]=$TDActiveStylings;
            $TDActiveStylings='';
            break;
        case 'cell':
            //Breite der Zelle berechnen + gesamtbreite der Tabelle
            if($TDAktiv!=0){
                $Br= $TDBreite[$TDAktiv]-$TDBreite[$TDAktiv-1];
                $TableBreite+=$Br;
            }else{
                $Br= $TDBreite[$TDAktiv];
                $TableBreite=$Br;
            }
            if($TableFontSet==true)$TDContent.='</font>';
            $TDContentOutput.='<td style="width:'.$Br.'px;'.$TDStylings[$TDAktiv].'">'.$TDContent.'</td>';
            $TDContent="";
            $TableFontSet=false;
            $TDAktiv++;
            break;
        case 'row':
            $tableActive=false;
            $OutputHTML.='<div><table style="width:'.$TableBreite.'px;"><tr style="'.$TRStyles.'">'.$TDContentOutput.'</tr></table></div>';
            break;
        //Ende des Paragraps
        case 'par':
            $OutputHTML.=$ParagraphStyles."'>".$ParagraphContent.ParagraphEndTag;
            $ParagraphStyles=ParagraphStartTag." style='";
            $ParagraphContent="";
            break;
        default:
            if($deffMode==false){
                if($tableActive==true){
                    $TDContent.=$Content;
                }else{
                    $ParagraphContent.=$Content;
                }
            }
            
    }
    //ausschalten des Definitionsmoduses
    if($GroupCounter < $deffStart){
        $deffMode=false;
    }
    
}
echo $OutputHTML;
