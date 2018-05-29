<?php
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
$RTF = str_replace('\{', '\geschwungeneKlammerAuf', $RTF);
$RTF = str_replace('\}', '\geschwungeneKlammerZu', $RTF);

$Befehle= explode('\\', $RTF);//splitte das Dokument bei jedem \ 
$OutputHTML="";//Das wird unsere Ausgabe;
$Befehlsverarbeitung=array();//Da sortier ich mir alle Befehle mit Content und Werten;
$ParagraphStyles="";$ParagraphContent="";//Dies ist der jeweilige Paragraph unserer Ausgabe;
$tableActive=false;$TDContentOutput;$TDContent="";$TRStyles="";$TableActiveBorder="";$TDStylings=array();$TDActiveStylings="";$TableFontSet=false;$TDBreite=array();$TableBreite=0;$TDAktiv=0;//Tabellenstyling
$deffMode=false;//DefinitionsModus An/Aus;
$GroupCounter=0;$deffStart=0;$Schriftarten=array();$ContentLength=0;$AnzPard=0;
$fontSet=false;//ob schon eine Schrift gesetzt wurde
$data="";$style="";//Bildvariablen
foreach($Befehle as $index => $B){
    if ($index==0) continue;
    $Mixed=false;$Befehl=$B;$Content="";$Wert=-1;//Setze Defaultvariablen
    //Sonderzeichen
    if(strpos($Befehl,"'")!==false){
        $Content=utf8_encode(chr(hexdec(substr($Befehl,1,2)))).substr($Befehl,3);
        $Befehl='Sonderzeichen';
        $Befehlsverarbeitung[]=array('Befehl'=>trim($Befehl),'Content'=>$Content,'Wert'=>$Wert);
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
        }else if($firstEnter<$firstSpace){
            $Mixed=explode(chr(13), $Befehl, 2);
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
    $Befehlsverarbeitung[]=array('Befehl'=>trim($Befehl),'Content'=>$Content,'Wert'=>$Wert);
}
foreach($Befehlsverarbeitung as $BE){
    $Befehl=$BE['Befehl'];$Content=$BE['Content'];$Wert=$BE['Wert'];
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
    $Content= str_replace('{', '', $Content);
    $Befehl= str_replace('{', '', $Befehl);
    $Content= str_replace('}', '', $Content);
    $Befehl= str_replace('}', '', $Befehl);
    switch ($Befehl) {
        //Konfiguration
        case 'deff':
            $deffMode=true;
            break;
        case 'generator':
            break;
        //Infos
        case 'title':
            break;
        case 'author':
            break;
        case 'company':
            break;
        case 'creatim':
            break;
        case 'yr':
            break;
        case 'mo':
            break;
        case 'dy':
            break;
        case 'hr':
            break;
        case 'min':
            break;
        case 'doccomm':
            break;
        //Escapte Sonderzeichen
        case 'geschwungeneKlammerAuf':
            if($tableActive==true)$TDContent.='{';
            else $ParagraphContent.='{';
            break;
        case 'geschwungeneKlammerZu':
            if($tableActive==true)$TDContent.='}';
            else $ParagraphContent.='}';
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
        case 'line':
            if($tableActive==true){
                $TDContent.='<br>'.$Content;                
            }else{
                $ParagraphContent.='<br>'.$Content;                
            }
            break;
        case 'b'://Fett
            if($tableActive==true){
                if($Wert>=0) $TDContent.='</b>'.$Content;                
                else $TDContent.='<b>'.$Content;
            }else{
                if($Wert>=0) $ParagraphContent.='</b>'.$Content;                
                else $ParagraphContent.='<b>'.$Content;
            }
            $ContentLength+=strlen(trim($Content));
            break;
        case 'i'://Kursiv
            if($tableActive==true){
                if($Wert>=0) $TDContent.='</i>'.$Content; 
                else $TDContent.='<i>'.$Content;
            }else{
                if($Wert>=0) $ParagraphContent.='</i>'.$Content; 
                else $ParagraphContent.='<i>'.$Content;
            }
            $ContentLength+=strlen(trim($Content));
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
                    $ParagraphContent.='<font face="'.$Schriftarten[trim($Befehl.$Wert)].'">'.$Content;//Setzen der Schriftart
                }
                $ContentLength+=strlen(trim($Content));
            }
            break;
        case 'fs'://Schriftgröße
            if($tableActive==true){
                $TDContent.='<span style="font-size:'.(preg_replace("/[^0-9,.]/", "", $Wert )/2).'pt;">'.$Content;
            }else{
                $ParagraphContent.='<span style="font-size:'.(preg_replace("/[^0-9,.]/", "", $Wert )/2).'pt;">'.$Content;
            }
            $ContentLength+=strlen(trim($Content));
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
            $TDContent.=$Content;
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
            if($Content!=''){
                $TDContent.=$Content;
            }
            $TableFontSet=false;
            $TDAktiv++;
            break;
        case 'row':
            $tableActive=false;
            $OutputHTML.='<div><table style="width:'.$TableBreite.'px;"><tr style="'.$TRStyles.'">'.$TDContentOutput.'</tr></table></div>';
            break;
        //Bild
        case 'pict{':
            $data="";$style="";
            if(ctype_xdigit(preg_replace('/\s+/', '', $Content))){
                $data=base64_encode(hex2bin(preg_replace('/\s+/', '', $Content)));
            }
            break;
        case 'sp':
            break;
        case 'sn':
            break;
        case 'sv':
            break;
        case 'picw':
            if(ctype_xdigit(preg_replace('/\s+/', '', $Content))){
                $data=base64_encode(hex2bin(preg_replace('/\s+/', '', $Content)));
                echo '<div><img style="'.$style.'" src="data:image/png;base64,'.$data.'"></div>';
            }
            break;
        case 'pich':
            if(ctype_xdigit(preg_replace('/\s+/', '', $Content))){
                $data=base64_encode(hex2bin(preg_replace('/\s+/', '', $Content)));
                echo '<div><img style="'.$style.'" src="data:image/png;base64,'.$data.'"></div>';
            }
            break;
        case 'picwgoal':
            $style.="width:".Twips2Pixel($Wert).'px;';
            if(ctype_xdigit(preg_replace('/\s+/', '', $Content))){
                $data=base64_encode(hex2bin(preg_replace('/\s+/', '', $Content)));
                echo '<div><img style="'.$style.'" src="data:image/png;base64,'.$data.'"></div>';
            }
            break;
        case 'pichgoal':
            $style.="height:".Twips2Pixel($Wert).'px;';
            if(ctype_xdigit(preg_replace('/\s+/', '', $Content))){
                $data=base64_encode(hex2bin(preg_replace('/\s+/', '', $Content))).'"';
                echo '<div><img style="'.$style.'" src="data:image/png;base64,'.$data.'"></div>';
            }
            break;
        //Ende des Paragraps
        case 'pard':
//            (($AnzPard==0)?'':$OutputHTML.=ParagraphStartTag.(($ParagraphStyles!='')?' style="'.$ParagraphStyles.'"':'').'>'.$ParagraphContent.ParagraphEndTag);
            $ParagraphStyles="";
            $ContentLength=0;
            $AnzPard++;
            break;
        case 'par':
                $OutputHTML.=ParagraphStartTag.(($ParagraphStyles!='')?' style="'.$ParagraphStyles.'"':'').'>'.(($ContentLength!=0)?$ParagraphContent:'<br class="bneLineFeed">'.$ParagraphContent).ParagraphEndTag;
                $ParagraphContent=$Content;
                $ContentLength= strlen($Content);
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
echo $OutputHTML.=ParagraphEndTag;
