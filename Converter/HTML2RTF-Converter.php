<?php
include('RTF-Formatierung.php');
include('BokuNoEditorFunctions.php');
include('Sonderzeichen.php');
include('Bilder.php');

$HTML=trim($_POST['Content']);
$HTMLSplit= array_filter(explode('</div>', $HTML));
$RTF=array();
$Paragraph="";
$Info= json_decode($_POST['Info'],TRUE);
foreach ($HTMLSplit as $P){
    $Format= substr($P,0,strpos($P, '>')+1);
    $Paragraph=substr($P,strpos($P, '>')+1);
    $Stylings=array();
    $StylingBefehlWert=array();
    if(strpos($Format, 'style=')){
        $Beginn=strpos($Format,'style="')+7;
        $Laenge=strpos($Format,'"',$Beginn)-$Beginn;
        $Styling= substr($Format, $Beginn, $Laenge);
        $Stylings= explode(';', $Styling);
        foreach ($Stylings as $S){
            if($S!=''){
                $StylingBefehlWert[]= explode(':', $S);
            }
        }
        foreach ($StylingBefehlWert as $SBW){
            $Befehl=trim($SBW[0]);
            $Wert=trim($SBW[1]);
            switch ($Befehl) {
                case 'text-align':
                    switch ($Wert) {
                        case 'left':
                            $Paragraph=setLinksbuendig($Paragraph);
                        break;
                        case 'center':
                            $Paragraph=setZentriert($Paragraph);
                        break;
                        case 'right':
                            $Paragraph=setRechtssbuendig($Paragraph);
                        break;
                    }
                break;
            }
        }
    }
    $Paragraph=makeParagraph($Paragraph);
    $RTF[]=iconv('UTF-8//IGNORE', 'CP1252//IGNORE',$Paragraph);
}
$RTF=implode('', $RTF);
createRTFFile(makeRTF($Info,null,null,$RTF));