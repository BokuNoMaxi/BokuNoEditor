<?php
function makeRTF($Info,$pArr,$format){
    $pArr= makeFormatierungHTML2RTFParagraph($pArr);
    $Content= implode('', $pArr['Content']);
    $Schriftarten=$pArr['Schriftarten'];
    $Deff= setDefinition($Info, $Schriftarten, null);
    $Seitenformat=setFormat($format);
    $Standards='\deflang1031\plain\fs26\widowctrl\hyphauto\ftnbj'.$Seitenformat.'\fs22';
    return '{\rtf1\ansi'.$Deff.$Standards.$Content.'}';
}
function setDefinition($Info,$Schriftarten,$Color){
    $SchriftartenDokument= setSchriftart($Schriftarten);
    $Farben= setColors($Color);
    $Dokumentinfo= setInformationen($Info);
    return '\deff0'.$SchriftartenDokument.$Farben.$Dokumentinfo;
}
function setSchriftart($Schriftarten){
    $DefinitionSchriftarten='{\f0 Arial;}';
    for($i=1;$i<count($Schriftarten)&&$Schriftarten!=null;$i++){
        if($Schriftarten[$i]!='Arial')$DefinitionSchriftarten.='{\f'.$i.' '.$Schriftarten[$i].';}';
    }
    return '{\fonttbl'.$DefinitionSchriftarten.'}';
}
function setColors($Color){
    $Farben='';
    for($i=0;$i<=count($Color)&&$Color!=null;$i++){
        $Farben.='{\red'.$Color[$i]['red'].'\blue'.$Color[$i]['blue'].'\green'.$Color[$i]['green'].';}';
    }
    return '{\colortbl;'.$Farben.'}';
}
function setInformationen($Info){
    if($Info['Datum'] != null)$Info['Datum']=DateTime::createFromFormat('Y.m.d H:i', $Info['Datum']);
    else $Info['Datum']= new DateTime();
    return '{\info{\title '.$Info['Title'].'}{\author '.$Info['Author'].'}{\company '.$Info['Company'].'}{\creatim\yr'.$Info['Datum']->format('Y').'\mo'.$Info['Datum']->format('m').'\dy'.$Info['Datum']->format('d').'\hr'.$Info['Datum']->format('H').'\min'.$Info['Datum']->format('i').'}{\doccomm '.$Info['Kommentar'].'}}';
}
function setFormat($format){
    $Seitenformat=$format['Seitenformat'];
    $Seitenverhaeltnis=$format['Seitenverhaeltnis'];
    $RTFFormat="";
    switch ($Seitenformat){
        case 'A4':
            $RTFFormat.='\paperw11906\paperh16838';
            break;
    }
    $RTFFormat.='\margl'.Pixel2Twips($Seitenverhaeltnis['l']).'\margt'.Pixel2Twips($Seitenverhaeltnis['t']).'\margr'.Pixel2Twips($Seitenverhaeltnis['r']).'\margb'.Pixel2Twips($Seitenverhaeltnis['b']);
    return $RTFFormat;
}
function makeFormatierungHTML2RTFParagraph($pArr){
    $Schriftarten=array('Arial');
    $RTF=array();
    foreach ($pArr as $p){//arbeite das Array Paragraph für Paragraph ab
        $RTFPraefix="";
        $p= str_replace('<div ', '', $p);//strip p tag vom Anfang
        //strip p - tag vom Content
        $pStyles= substr($p, 0, strpos($p, '>'));
        $pContent= substr($p, strpos($p, '>')+1);
        //wenn der p - tag formatiert wurde konvertiere HTML2RTF
        if(strstr($pStyles,'style')!=false){
            $Styles= str_replace('style=', '', $pStyles);//strip style= vom String
            $Stylings= array_filter(explode(';', substr($Styles, 1,strpos($Styles, '"',2)-1)));//liefere mir nur die CSS Attribute:value;
            foreach ($Stylings as $S){
                $a = explode(':', $S);
                $Tag=trim($a[0]);
                $Value=trim($a[1]);
                switch ($Tag){
                    case 'font-size':
                        if(strstr($Value, 'px')){
                            $Value= Pixel2Point(str_replace('px', '', $Value));
                        }
                        $RTFPraefix=setFontSize(trim(str_replace('pt', '', $Value))*2);
                        break;
                    case 'text-align':
                        switch ($Value){
                            case 'left':
                                $RTFPraefix= setLinksbuendig($RTFPraefix);
                                break;
                            case 'center':
                                $RTFPraefix= setZentriert($RTFPraefix);
                                break;
                            case 'right':
                                $RTFPraefix= setRechtssbuendig($RTFPraefix);
                                break;
                        }
                        break;
                }
            }
        }
        //lass den Content formatieren
        $RTFContent= makeFormatierungHTML2RTFContent($pContent, $Schriftarten);
        $Schriftarten=$RTFContent['Schriftarten'];
        $RTFParagraph= makeGroup(makeParagraph($RTFPraefix.$RTFContent['RTF']));
        $RTF[]=str_replace(array('$nbsp;','&#65279;','\ufeff'), ' ',iconv('UTF-8//IGNORE', 'CP1252//IGNORE',$RTFParagraph));
    }
    return array('Content'=>$RTF,'Schriftarten'=>$Schriftarten);
}
function makeFormatierungHTML2RTFContent($HTMLline,$Schriftarten){
    $SpanFormatedContent='';
    $FontFormatedContent='';
    $TableFormatedContent='';
    $Ausgabe=array('RTF'=>'','Schriftarten'=>array());
    //Fett
    $HTMLline=str_replace("<b>", "\b ", $HTMLline);
    $HTMLline=str_replace("</b>", "\b0 ", $HTMLline);
    //Kursiv
    $HTMLline=str_replace("<i>", "\i ", $HTMLline);
    $HTMLline=str_replace("</i>", "\i0 ", $HTMLline);
    //Formatierung SPAN tag
    $HTMLline=str_replace("</span>", stopGroup(), $HTMLline);
    $HTMLline=str_replace("</font>", stopGroup(), $HTMLline);
    //Tabelle
    $HTMLline=str_replace("</table>", "", $HTMLline);
    $HTMLline=str_replace("</tbody>", "", $HTMLline);
    $HTMLline=str_replace("<tbody>", "", $HTMLline);
    $HTMLline=str_replace("<table>", "", $HTMLline);
    $HTMLline=str_replace("</tr>", "\\row ", $HTMLline);
    $HTMLline=str_replace("<td>", "", $HTMLline);
    $HTMLline=str_replace("</td>", "\cell ", $HTMLline);
    //Sonderzeichen
    $HTMLline=str_replace("<br>", br, $HTMLline);
    $HTMLline=str_replace(chr(160), ' ', $HTMLline);
    
    //Span-Styles Formatierung
    if(strstr($HTMLline ,'<span')){
        $SPAN= array_filter(explode('<span ', $HTMLline));
        foreach ($SPAN as $s) {
            if(strstr($s, 'style')){
                $s= str_replace('style=', '', $s);//strip style attr von span
                $Styles= explode(';',substr($s, 1, strpos($s, '"',2)-2));//splitter alle Style attribute auf
                $Endpunkt= strpos($s, '>');//endposition des span tags
                $SpanUnformatedContent= substr($s, $Endpunkt+1);//restlicher content innerhalb des spans
                foreach($Styles as $ST){//geh die stylings die am span hängen durch
                    //trenne Tag und Value
                    $a = explode(':', $ST);
                    $Tag= trim($a[0]);
                    $Value= trim($a[1]); 
                    //füge Stylings an
                    switch ($Tag){
                        case 'font-size':
                                $SpanFormatedContent.= startGroup().setFontSize(trim(str_replace('pt', '', $Value))*2).$SpanUnformatedContent;
                        break;
                    }
                }
            }else{
                $SpanFormatedContent.=$s;
            }
        }
        $HTMLline=$SpanFormatedContent;
    }
    //Font-Formatierung
    if(strstr($HTMLline,'<font')){
        $FONT= array_filter(explode('<font ',$HTMLline));
        foreach ($FONT as $f){
            if (strstr($f,'face')){
                $f= str_replace('face=', '', $f);//strip face attr von font
                $fontParagraph= substr($f,1, strpos($f, '"',2)-1);//die Schriftart die verwendet wird
                $Endpunkt=strpos($f,'>');//endposition des Fonts
                $FontUnformatedContent= substr($f, $Endpunkt+1);//restlicher content innerhalb des fonts
                //wenn die Schriftart nicht gefunden wurde dann Trag sie in das array ein
                if(array_search($fontParagraph, $Schriftarten)===false){
                    $Schriftarten[]=$fontParagraph;
                }
                $FontFormatedContent.= startGroup().setFontFamily(array_search($fontParagraph, $Schriftarten)).$FontUnformatedContent;
            }else{
                $FontFormatedContent.=$f;
            }
        }
        $HTMLline=$FontFormatedContent;
    }
    //Tabelle
    if(strstr($HTMLline ,'<tr>')){
        foreach(explode('<tr>',$HTMLline) as $R){
            if(strstr($R,'\cell')){
                $TableFormatedContent.= '\trowd\trgaph180';
                for($i=1;$i<=substr_count($R, '\cell');$i++){
                    $TableFormatedContent.='\cellx'.$i* Pixel2Twips(200);
                }
                $TableFormatedContent.=$R;
            }
        }
        $HTMLline=$TableFormatedContent;
    }
    //Ende der Formatierung und ausgabe der Line
    $Ausgabe['RTF']=$HTMLline;
    $Ausgabe['Schriftarten']=$Schriftarten;
    return $Ausgabe;
}
function Pixel2Point($Pixel){
    return intval(round($Pixel*0.75));
}
function Pixel2Twips($Pixel){
    return intval(round($Pixel*15));
}
//RTF - Formatierung 
function setStandardformatierung($Text){
    return '\plain '.$Text;
}
function startKursiv(){
    return '\i ';
}
function stopKursiv(){
    return '\i0';
}
function setKursiv($Text){
    return '\i '.$Text.'\i0 ';
}
function startFett(){
    return '\b ';
}
function stopFett(){
    return '\b0';
}
function setFett($Text){
    return '\b '.$Text.'\b0 ';
}
function setUnderline($Text){
    return '\ul '.$Text.'\ul0';
}
function setHochstellen($Text){
    return '\super '.$Text.'\super0';
}
function setTiefstellen($Text){
    return '\sub '.$Text.'\sub0';
}
function setGrossschreiben($Text){
    return '\scaps '.$Text.'\scaps0';
}
function setDurchgestrichen($Text){
    return '\strike '.$Text.'\strike0';
}
function setLinksbuendig($Text){
    return '\ql '.$Text;
}
function setZentriert($Text){
    return '\qc '.$Text;
}
function setRechtssbuendig($Text){
    return '\qr '.$Text;
}
function setBlocksatz($Text){
    return '\qj '.$Text;
}
function startGroup(){
    return '{';
}
function stopGroup(){
    return '}';
}
function makeGroup($Text){
    return '{'.$Text.'}';
}
function makeParagraph($Text){
    return'\pard '.$Text.'\par';
}
function setFontSize($dblPt){
    return '\fs'.$dblPt.' ';
}
function setFontFamily($FamilyPosition){
    return '\f'.$FamilyPosition.' ';
}