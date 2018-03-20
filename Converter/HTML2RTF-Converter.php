<?php
include('RTF-Formatierung.php');
include('BokuNoEditorFunctions.php');
include('Sonderzeichen.php');
include('Bilder.php');

$HTML=trim(html_entity_decode ($_POST['Content']));
$HTMLSplit= array_filter(explode('</div>', $HTML));
$RTF=array();
$Paragraph="";
$Info= json_decode($_POST['Info'],TRUE);
$Schriftarten=array('Arial');
foreach ($HTMLSplit as $P){
    $Format= substr($P,0,strpos($P, '>')+1);
    $Paragraph=substr($P,strpos($P, '>')+1);
    $Stylings=array();
    $StylingBefehlWert=array();
    $FormatReihenfolge=array();
    $RTFParagraph='';
    //Absatzformatierung
    if(strpos($Format, 'style=')){
        $Beginn=strpos($Format,'style="')+7;
        $Laenge=strrpos($Format,'"')-$Beginn;
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
                            $RTFParagraph.=setLinksbuendig($RTFParagraph);
                        break;
                        case 'center':
                            $RTFParagraph.=setZentriert($RTFParagraph);
                        break;
                        case 'right':
                            $RTFParagraph.=setRechtssbuendig($RTFParagraph);
                        break;
                    }
                break;
            }
        }
    }
    //Im Text formatierung
    $Stylings= array_filter(explode('<span', $Paragraph));
    foreach ($Stylings as $S){
        $ParagraphFormats=array();
        $Ende= substr($S, strpos($S, '>')+1);
        $AnzEndTag= substr_count($Ende,'</span>');
        if(strpos($S, 'style=')){
            $Beginn=strpos($S,'style="')+7;
            $Laenge=strrpos($S,'"')-$Beginn;
            $Styling= substr($S, $Beginn, $Laenge);
            foreach (array_filter(explode(';', $Styling)) as $ST){
                $ParagraphFormats[]=explode(':', $ST) ;
            }
        }
        foreach($ParagraphFormats as $PF){
            switch ($PF[0]){
                case 'font-style':
                    switch (trim($PF[1])){
                        case 'italic':
                            $FormatReihenfolge[]='i';
                            $RTFParagraph.=startKursiv();
                            break;
                        case 'normal':
                            $FormatReihenfolge[]='n';
                            $RTFParagraph.=stopKursiv();
                            break;
                            
                    }
                break;
                case 'font-weight':
                    switch (trim($PF[1])){
                        case 'bold':
                            $FormatReihenfolge[]='b';
                            $RTFParagraph.=startFett();
                            break;
                        case 'normal':
                            $FormatReihenfolge[]='n';
                            $RTFParagraph.=stopFett();
                            break;
                    }
                break;
                case 'font-size':
                    $FormatReihenfolge[]='fs';
                    $RTFParagraph.=startGroup().setFontSize(2*intval($PF[1]));
                break;
                case 'font-family':
                    $FormatReihenfolge[]='ff';
                    if($i=array_search(trim($PF[1]), $Schriftarten)){
                        $RTFParagraph.=startGroup().setFontFamily($i-1);
                    }else{
                        $Schriftarten[]= trim(str_replace('"','',$PF[1]));
                        $RTFParagraph.=startGroup().setFontFamily(count($Schriftarten)-1);
                    }
                break;
            }
        }
        //Text Einfügen
        if($AnzEndTag>0){
            $SplitSpan= explode('</span>',$Ende );
            foreach ($SplitSpan as $SS){
                switch (array_pop($FormatReihenfolge)){
                    case 'i':
                        $RTFParagraph.=$SS.stopKursiv();
                    break;
                    case 'b':
                        $RTFParagraph.=$SS.stopFett();
                    break;
                    case 'fs':
                        $RTFParagraph.=$SS.stopGroup();
                        break;
                    case 'ff':
                        $RTFParagraph.=$SS.stopGroup();
                        break;
                    default:
                        $RTFParagraph.=$SS;
                }
            }
        }else if($AnzEndTag==0&&!strpos($S, 'style=')){
            $RTFParagraph.=$S;
            
        }
    }
   
    
    
    $Paragraph=makeParagraph($RTFParagraph);
    var_dump($Paragraph);
    $RTF[]=iconv('UTF-8//IGNORE', 'CP1252//IGNORE',$Paragraph);
}
$RTF=implode('', $RTF);
createRTFFile(makeRTF($Info,$Schriftarten,null,$RTF));