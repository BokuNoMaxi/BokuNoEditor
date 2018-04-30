<?php
include('Konstanten.php');
include('BokuNoEditorFunctions.php');
$RTF = file_get_contents('../FileImport/'.$_POST['RTF']);//schreibe Inhalt des Dokuments in ein File
//Strip Problematisches
$RTF = str_replace('{\*\generator Riched20 10.0.16299}', '', $RTF);
$RTF = str_replace('\fnil', '', $RTF);
$RTF = str_replace('\fcharset0', '', $RTF);
$RTF = str_replace('\fswiss', '', $RTF);
$RTF = str_replace('\froman', '', $RTF);
$RTF = str_replace('\fprq2', '', $RTF);

$Befehle= explode('\\', $RTF);//splitte das Dokument bei jedem \ 
$OutputHTML="";//Das wird unsere Ausgabe;
//Dies ist der jeweilige Paragraph unserer Ausgabe;
$ParagraphStyles=ParagraphStartTag." style='";
$ParagraphContent="";
$deffMode=false;//DefinitionsModus An/Aus;
$GroupCounter=0;$deffStart=0;$Schriftarten=array();
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
    if(strpos($Befehl, '{')!==false||strpos($Content, '{')!==false){
        $anzGroup=substr_count($Befehl,'{')+substr_count($Content,'{');
    }
    if(strpos($Befehl, '}')!==false||strpos($Content, '}')!==false){
        $anzEndGroup=(-substr_count($Befehl,'}')-substr_count($Content,'}'));
    }
    $GroupCounter=$GroupCounter+($anzGroup+$anzEndGroup);
    if($deffMode==true&&strpos($Befehl, '{')!==false&&$deffStart===0){
        $deffStart=$GroupCounter;
    }
    switch (trim($Befehl)) {
        //Konfiguration
        case 'deff':
            $deffMode=true;
            break;
        //Paragraph
        case 'qr'://Rechtsbündig
            $ParagraphStyles.='text-align:right;';
            $ParagraphContent=$Content;
            break;
        case 'qc'://Zentriert
            $ParagraphStyles.='text-align:center;';
            $ParagraphContent=$Content;
            break;
        case 'ql'://Linkssbündig
            $ParagraphStyles.='text-align:left;';
            $ParagraphContent=$Content;
            break;
        //Paragraph Content
        case 'b'://Fett
            if($Wert>=0) $ParagraphContent.=$Content.'</b>';                
            else $ParagraphContent.='<b>'.$Content;
            break;
        case 'i'://Kursiv
            if($Wert>=0) $ParagraphContent.=$Content.'</i>'; 
            else $ParagraphContent.='<i>'.$Content;
            break;
        case 'f'://Schriftart
            if($deffMode==true){
                $Schriftarten[$Befehl.$Wert]=substr($Content,0, strpos($Content, ';'));
            }else{
                $ParagraphContent.='<font face="'.$Schriftarten[$Befehl.$Wert].'">'.$Content;
            }
            break;
        case 'fs'://Schriftgröße
            $ParagraphContent.='<span style="font-size:'.($Wert/2).'pt;">'.$Content;
            break;
        //Ende des Paragraps
        case 'par':
            $OutputHTML.=$ParagraphStyles."'>".$ParagraphContent.ParagraphEndTag;
            $ParagraphStyles=ParagraphStartTag." style='";
            $ParagraphContent="";
            break;
        default:
            $ParagraphContent.=$Content;
            
    }
    //ausschalten des Definitionsmoduses
    if($GroupCounter < $deffStart){
        $deffMode=false;
    }
    
}
echo $OutputHTML;
