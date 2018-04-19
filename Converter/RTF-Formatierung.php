<?php
function makeRTF($Info,$pArr,$format){
    $pArr= makeFormatierungHTML2RTFParagraph($pArr);
    $Content= implode('', $pArr['Content']);
    $Schriftarten=$pArr['Schriftarten'];
    $Farben=$pArr['Farben'];
    $Deff= setDefinition($Info, $Schriftarten, $Farben);
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
    $Farben="";
    foreach($Color as $C){
        $Farben.='\red'.$C['red'].'\blue'.$C['blue'].'\green'.$C['green'].';';
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
    $Farben=array(array('red'=>0,'green'=>0,'blue'=>0));
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
        $RTFContent= makeFormatierungHTML2RTFContent($pContent, $Schriftarten,$Farben);
        $Schriftarten=$RTFContent['Schriftarten'];
        $Farben=$RTFContent['Farben'];
        $RTFParagraph= makeGroup(makeParagraph($RTFPraefix.$RTFContent['RTF']));
        $RTF[]=str_replace(array('$nbsp;','&#65279;','\ufeff'), ' ',iconv('UTF-8//IGNORE', 'CP1252//IGNORE',$RTFParagraph));
    }
    return array('Content'=>$RTF,'Schriftarten'=>$Schriftarten,'Farben'=>$Farben);
}
function makeFormatierungHTML2RTFContent($HTMLline,$Schriftarten,$Farben){
    $SpanFormatedContent='';
    $FontFormatedContent='';
    $TableFormatedContent='';
    $IMGFormatedContent="";
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
    $HTMLline=str_replace("</td>", "\cell ", $HTMLline);
    //Sonderzeichen
    $HTMLline=str_replace("<br>", br, $HTMLline);
    $HTMLline=str_replace(chr(160), ' ', $HTMLline);
    
    //Span-Styles Formatierung
    if(strpos($HTMLline ,'<span')!==false){
        $SPAN= array_filter(explode('<span ', $HTMLline));
        foreach ($SPAN as $s) {
            if(strpos($s, 'style')!==false){
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
    if(strpos($HTMLline,'<font')!==false){
        $FONT= array_filter(explode('<font ',$HTMLline));
        foreach ($FONT as $f){
            if (strpos($f,'face')!==false){
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
    if(strpos($HTMLline ,'<tr>')!==false){
        foreach(explode('<tr>',$HTMLline) as $R){
            $TableUnformatedContent="";
            $TDStylings=array_filter(explode('<td ',$R));
            if(strstr($R,'\cell')){
                $TableFormatedContent.= '\trowd\trgaph180';
                //Formatierung der Zellen
                foreach($TDStylings as $index=>$ST){
                    $ST= str_replace('style=', '', $ST);
                    $Styles= explode(';',substr($ST, 1, strpos($ST, '"',2)-2));
                    $Endpunkt= strpos($ST, '>');
                    $TableUnformatedContent.=substr($ST, $Endpunkt+1);
                    foreach($Styles as $sST){
                        $sST= explode(':', $sST);
                        $Tag=trim($sST[0]);
                        $Value=trim($sST[1]);
                        Switch($Tag){
                            case 'border':
                                $BorderWidth= trim(substr($Value, 0, strpos($Value, ' ')));
                                $BorderStyle= trim(substr($Value, strpos($Value, ' '),strpos($Value, ' ',strpos($Value, ' ')+1)-2));
                                $BorderColor= colorHTMLtoRGBArr(trim(substr($Value, strpos($Value, ' ',strpos($Value, ' ')+1))));
                                //Rahmen Breite
                                $BorderWidthRTF='\brdrw'.Pixel2Twips(intval($BorderWidth));
                                //Rahmen Stil
                                switch ($BorderStyle){
                                    case 'solid':
                                        $BorderStyleRTF='\brdrs';
                                        break;
                                    case 'dotted':
                                        $BorderStyleRTF='\brdrdot';
                                        break;
                                    case 'dashed':
                                        $BorderStyleRTF='\brdrdash';
                                        break;
                                    case 'double':
                                        $BorderStyleRTF='\brdrdb';
                                        break;
                                }
                                //Rahmenfarbe
                                $Farben=FarbenController($BorderColor,$Farben);
                                $BorderColorRTF='\brdrcf'. (array_search($BorderColor, $Farben)+1);
                                $TableFormatedContent.='\clbrdrt\clpadft3\clpadt113'.$BorderWidthRTF.$BorderStyleRTF.$BorderColorRTF;
                                $TableFormatedContent.='\clbrdrl\clpadfl3\clpadl113'.$BorderWidthRTF.$BorderStyleRTF.$BorderColorRTF;
                                $TableFormatedContent.='\clbrdrr\clpadrl3\clpadr113'.$BorderWidthRTF.$BorderStyleRTF.$BorderColorRTF;
                                $TableFormatedContent.='\clbrdrb\clpadfb3\clpadb113'.$BorderWidthRTF.$BorderStyleRTF.$BorderColorRTF;
                                break;
                        }
                        $TableFormatedContent.='\cellx'.$index* Pixel2Twips(200);
                    }
                }
                //Ausgabe des Contents der Zellen
                $TableFormatedContent.=$TableUnformatedContent;
            }
        }
        $HTMLline=$TableFormatedContent;
    }
    //Bild
     if(strpos($HTMLline,'<img')!==false){
        $IMG= array_filter(explode('<img ',$HTMLline));
        foreach ($IMG as $I){
            $IMGunformatedContent="";
            if (strpos($I,'style=')!==false &&strpos($I,'src=')!==false){
                //Bilddatei
                $srcPos=strpos($I,'src=')+5;
                $srcBase64= substr($I, $srcPos, strpos($I,'"',$srcPos)-$srcPos);
                $Base64=trim(substr($srcBase64, strpos($srcBase64,',')+1));
                $Filetype=substr($srcBase64, strpos($srcBase64,'/')+1,strpos($srcBase64,';')-strpos($srcBase64,'/')-1);
                $HexData=bin2hex(base64_decode($Base64));
                switch ($Filetype){
                    case 'bmp':
                        $IMGunformatedContent.='\picbmp';
                        break;
                    case 'png':
                        $IMGunformatedContent.='\pngblip';
                        break;
                    case 'jpeg':
                        $IMGunformatedContent.='\jpegblip';
                        break;
                }
                //Bildformatierungen
                $stylePos=strpos($I,'style=')+7;
                $stylesImg= array_filter(explode(';',substr($I, $stylePos,strpos($I, '"',$stylePos)-$stylePos)));
                foreach ($stylesImg as $SI) {
                    $thisStyle= array_filter(explode(':',$SI));
                    $tag=trim($thisStyle[0]);
                    $value=trim($thisStyle[1]);
                    switch ($tag){
                        case 'width':
                            $IMGunformatedContent.='\picw'.intval($value).'\picwgoal'. Pixel2Twips(intval($value));
                            break;
                        case 'height':
                            $IMGunformatedContent.='\pich'.intval($value).'\pichgoal'. Pixel2Twips(intval($value));
                            break;
                    }
                }
                $IMGFormatedContent.= '{\pict '.$IMGunformatedContent.' '.$HexData.'}';
            }else{
                $IMGFormatedContent.=$I;
            }
        }
        $HTMLline=$IMGFormatedContent;
    }
    //Ende der Formatierung und ausgabe der Line
    $Ausgabe['RTF']=$HTMLline;
    $Ausgabe['Schriftarten']=$Schriftarten;
    $Ausgabe['Farben']=$Farben;
    return $Ausgabe;
}
//Umrechnungen
function Pixel2Point($Pixel){
    return intval(round($Pixel*0.75));
}
function Pixel2Twips($Pixel){
    return intval(round($Pixel*15));
}
//Kontrolliert ob die Farbe schon mal vorgekommen ist, wenn nicht füge sie im Array an
function FarbenController($RGB,$FarbenArr){
    if(array_search($RGB, $FarbenArr)===false) $FarbenArr[]=$RGB;
    return $FarbenArr;
}
//schlüssle CSS RGB auf und gib es als Array zurück
function colorHTMLtoRGBArr($HTML){
    $HTML=explode(',',substr($HTML, strpos($HTML, '(')+1,-1));
    return array('red'=>intval($HTML[0]),'green'=>intval($HTML[1]),'blue'=>intval($HTML[2]));
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