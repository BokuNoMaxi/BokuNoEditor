<?php
//Erzeuge aus HTML Code RTF Code
function makeRTF($Info,$pArr,$format){
    $pArr= makeFormatierungHTML2RTFParagraph($pArr);//wandle HTML Tags zu RTF Tags um
    $Content= implode('', $pArr['Content']);//Mach das Array mit dem RTF zu einem langen String
    $Schriftarten=$pArr['Schriftarten'];//Die Schriftarten die im Dokument verwendet werden
    $Farben=$pArr['Farben'];//Die Farben die im Dokument verwendet werden
    $Deff= setDefinition($Info, $Schriftarten, $Farben);//Der Header des RTFs Dokuments
    $Seitenformat=setFormat($format);//Dokumenteigenschaften wie Abstand vom Rand usw
    $Standards='\deflang1031\plain\fs26\widowctrl\hyphauto\ftnbj'.$Seitenformat.'\fs22';//Standarddokumenteinstellung die empfohlen werden
    return '{\rtf1\ansi'.$Deff.$Standards.$Content.'}';
}
//Erzeuge die Kopfzeile des RTF-Dokuments
function setDefinition($Info,$Schriftarten,$Color){
    $SchriftartenDokument= setSchriftart($Schriftarten);
    $Farben= setColors($Color);
    $Dokumentinfo= setInformationen($Info);
    return '\deff0'.$SchriftartenDokument.$Farben.$Dokumentinfo;
}
//erzeuge die Schriftarttabelle
function setSchriftart($Schriftarten){
    $DefinitionSchriftarten='{\f0 Arial;}';
    for($i=1;$i<count($Schriftarten)&&$Schriftarten!=null;$i++){
        if($Schriftarten[$i]!='Arial')$DefinitionSchriftarten.='{\f'.$i.' '.$Schriftarten[$i].';}';
    }
    return '{\fonttbl'.$DefinitionSchriftarten.'}';
}
//erzeuge die Farbtabelle
function setColors($Color){
    $Farben="";
    foreach($Color as $C){
        $Farben.='\red'.$C['red'].'\blue'.$C['blue'].'\green'.$C['green'].';';
    }
    return '{\colortbl;'.$Farben.'}';
}
//Setze die Informationen des Dokuments
function setInformationen($Info){
    if($Info['Datum'] != null)$Info['Datum']=DateTime::createFromFormat('Y.m.d H:i', $Info['Datum']);
    else $Info['Datum']= new DateTime();
    return '{\info{\title '.$Info['Title'].'}{\author '.$Info['Author'].'}{\company '.$Info['Company'].'}{\creatim\yr'.$Info['Datum']->format('Y').'\mo'.$Info['Datum']->format('m').'\dy'.$Info['Datum']->format('d').'\hr'.$Info['Datum']->format('H').'\min'.$Info['Datum']->format('i').'}{\doccomm '.$Info['Kommentar'].'}}';
}
//Setze die Seitenverhältnisse des Dokuments
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
//Wandle HTML Code zu RTF Code um
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
                if(count($a)>1){
                    $Tag=trim($a[0]);
                    $Value=trim($a[1]);
                }else{
                    $Tag=trim($a[0]);
                    $Value=null;
                }
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
                            case 'justify':
                                $RTFPraefix= setBlocksatz($RTFPraefix);
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
        $RTFParagraph= ((strpos($RTFContent['RTF'], '\trowd')!==false)?$RTFPraefix.$RTFContent['RTF']:makeGroup(makeParagraph($RTFPraefix.$RTFContent['RTF'])));
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
    $HTMLline=str_replace("</tr>", "\\row ", $HTMLline);
    $HTMLline=str_replace("</td>", "\cell ", $HTMLline);
    //Sonderzeichen
    $HTMLline=str_replace("<br>", br, $HTMLline);
    $HTMLline=str_replace(chr(160), ' ', $HTMLline);
    //Tabelle
    $HTMLline=str_replace("<table>", "", $HTMLline);
    if(strpos($HTMLline ,'<tr')!==false){
        foreach(explode('<tr',$HTMLline) as $R){
            $R= substr($R, strpos($R,'>')+1);
            $TableUnformatedContent="";
            $TableUnformatedContentStyles='';//Inhalt der Zelle splitten und speichern
            $TDStylings=array_filter(explode('<td ',$R));
            if(strstr($R,'\cell')){
                $TableFormatedContent.= '\trowd\trgaph180';
                //Formatierung der Zellen
                foreach($TDStylings as $index=>$ST){
                    $BorderTop="\clbrdrt";$BorderLeft="\clbrdrl";$BorderRight="\clbrdrr";$BorderBottom="\clbrdrb";//Rahmen der Zellen vordefinieren
                    $Endpunkt= strpos($ST, '>');
                    $TableUnformatedContentActive=substr($ST, $Endpunkt+1);//Inhalt der Zelle splitten und speichern
                    $ST= str_replace('style=', '', $ST);
                    $Styles= explode(';',substr($ST, 1, strpos($ST, '"',2)-2));//die einzelnen Stylings
                    //Umwandlung der einzelnen Style Tags
                    foreach($Styles as $sST){
                        $sST= explode(':', $sST);
                        if(count($sST)>1){
                            $Tag=trim($sST[0]);
                            $Value=trim($sST[1]);
                        }else{
                            $Tag=trim($sST[0]);
                            $Value=null;
                        }
                        Switch($Tag){
                            case 'border-top-style':
                                switch ($Value){
                                    case 'solid':
                                        $BorderTop.='\brdrs';
                                        break;
                                    case 'dotted':
                                        $BorderTop.='\brdrdot';
                                        break;
                                    case 'dashed':
                                        $BorderTop.='\brdrdash';
                                        break;
                                    case 'double':
                                        $BorderTop.='\brdrdb';
                                        break;
                                }
                                break;
                            case 'border-left-style':
                                switch ($Value){
                                    case 'solid':
                                        $BorderLeft.='\brdrs';
                                        break;
                                    case 'dotted':
                                        $BorderLeft.='\brdrdot';
                                        break;
                                    case 'dashed':
                                        $BorderLeft.='\brdrdash';
                                        break;
                                    case 'double':
                                        $BorderLeft.='\brdrdb';
                                        break;
                                }
                                break;
                            case 'border-right-style':
                                switch ($Value){
                                    case 'solid':
                                        $BorderRight.='\brdrs';
                                        break;
                                    case 'dotted':
                                        $BorderRight.='\brdrdot';
                                        break;
                                    case 'dashed':
                                        $BorderRight.='\brdrdash';
                                        break;
                                    case 'double':
                                        $BorderRight.='\brdrdb';
                                        break;
                                }
                                break;
                            case 'border-bottom-style':
                                switch ($Value){
                                    case 'solid':
                                        $BorderBottom.='\brdrs';
                                        break;
                                    case 'dotted':
                                        $BorderBottom.='\brdrdot';
                                        break;
                                    case 'dashed':
                                        $BorderBottom.='\brdrdash';
                                        break;
                                    case 'double':
                                        $BorderBottom.='\brdrdb';
                                        break;
                                }
                                break;
                            case 'border-top-width':
                                if($Value != null)$BorderTop.='\brdrw'.Pixel2Twips(intval($Value));
                                break;
                            case 'border-left-width':
                                if($Value != null)$BorderLeft.='\brdrw'.Pixel2Twips(intval($Value));
                                break;
                            case 'border-right-width':
                                if($Value != null)$BorderRight.='\brdrw'.Pixel2Twips(intval($Value));
                                break;
                            case 'border-bottom-width':
                                if($Value != null)$BorderBottom.='\brdrw'.Pixel2Twips(intval($Value));
                                break;
                            case 'border-top-color':
                                if($Value != null){
                                    $BorderColor=colorHTMLtoRGBArr($Value);
                                    $Farben=FarbenController($BorderColor,$Farben);
                                    $BorderTop.='\brdrcf'. (array_search($BorderColor, $Farben)+1);
                                }
                                break;
                            case 'border-left-color':
                                if($Value != null){
                                    $BorderColor=colorHTMLtoRGBArr($Value);
                                    $Farben=FarbenController($BorderColor,$Farben);
                                    $BorderLeft.='\brdrcf'. (array_search($BorderColor, $Farben)+1);
                                }
                                break;
                            case 'border-right-color':
                                if($Value != null){
                                    $BorderColor=colorHTMLtoRGBArr($Value);
                                    $Farben=FarbenController($BorderColor,$Farben);
                                    $BorderRight.='\brdrcf'. (array_search($BorderColor, $Farben)+1);
                                }
                                break;
                            case 'border-bottom-color':
                                if($Value != null){
                                    $BorderColor=colorHTMLtoRGBArr($Value);
                                    $Farben=FarbenController($BorderColor,$Farben);
                                    $BorderBottom.='\brdrcf'. (array_search($BorderColor, $Farben)+1);
                                }
                                break;
                            case 'border-left':
                                $border= explode(' ', $Value,3);
                                if($border[0] >= 0)$BorderLeft.='\brdrw'.Pixel2Twips(intval($border[0]));
                                switch ($border[1]){
                                    case 'solid':
                                        $BorderLeft.='\brdrs';
                                        break;
                                    case 'dotted':
                                        $BorderLeft.='\brdrdot';
                                        break;
                                    case 'dashed':
                                        $BorderLeft.='\brdrdash';
                                        break;
                                    case 'double':
                                        $BorderLeft.='\brdrdb';
                                        break;
                                }
                                $BorderColor=colorHTMLtoRGBArr($border[2]);
                                $Farben=FarbenController($BorderColor,$Farben);
                                $BorderLeft.='\brdrcf'. (array_search($BorderColor, $Farben)+1);
                                break;
                            case 'border-right':
                                $border= explode(' ', $Value,3);
                                if($border[0] >= 0)$BorderRight.='\brdrw'.Pixel2Twips(intval($border[0]));
                                switch ($border[1]){
                                    case 'solid':
                                        $BorderRight.='\brdrs';
                                        break;
                                    case 'dotted':
                                        $BorderRight.='\brdrdot';
                                        break;
                                    case 'dashed':
                                        $BorderRight.='\brdrdash';
                                        break;
                                    case 'double':
                                        $BorderRight.='\brdrdb';
                                        break;
                                }
                                $BorderColor=colorHTMLtoRGBArr($border[2]);
                                $Farben=FarbenController($BorderColor,$Farben);
                                $BorderRight.='\brdrcf'. (array_search($BorderColor, $Farben)+1);
                                break;
                            case 'border-top':
                                $border= explode(' ', $Value,3);
                                if($border[0] >= 0)$BorderTop.='\brdrw'.Pixel2Twips(intval($border[0]));
                                switch ($border[1]){
                                    case 'solid':
                                        $BorderTop.='\brdrs';
                                        break;
                                    case 'dotted':
                                        $BorderTop.='\brdrdot';
                                        break;
                                    case 'dashed':
                                        $BorderTop.='\brdrdash';
                                        break;
                                    case 'double':
                                        $BorderTop.='\brdrdb';
                                        break;
                                }
                                $BorderColor=colorHTMLtoRGBArr($border[2]);
                                $Farben=FarbenController($BorderColor,$Farben);
                                $BorderTop.='\brdrcf'. (array_search($BorderColor, $Farben)+1);
                                break;
                            case 'border-bottom':
                                $border= explode(' ', $Value,3);
                                if($border[0] >= 0)$BorderBottom.='\brdrw'.Pixel2Twips(intval($border[0]));
                                switch ($border[1]){
                                    case 'solid':
                                        $BorderBottom.='\brdrs';
                                        break;
                                    case 'dotted':
                                        $BorderBottom.='\brdrdot';
                                        break;
                                    case 'dashed':
                                        $BorderBottom.='\brdrdash';
                                        break;
                                    case 'double':
                                        $BorderBottom.='\brdrdb';
                                        break;
                                }
                                $BorderColor=colorHTMLtoRGBArr($border[2]);
                                $Farben=FarbenController($BorderColor,$Farben);
                                $BorderBottom.='\brdrcf'. (array_search($BorderColor, $Farben)+1);
                                break;
                            case 'text-align':
                                switch (trim($Value)) {
                                    case 'left':
                                        $TableUnformatedContentActive= setLinksbuendig($TableUnformatedContentActive);
                                        break;
                                    case 'center':
                                        $TableUnformatedContentActive= setZentriert($TableUnformatedContentActive);
                                        break;
                                    case 'right':
                                        $TableUnformatedContentActive= setRechtssbuendig($TableUnformatedContentActive);
                                        break;
                                    case 'justify':
                                        $TableUnformatedContentActive= setBlocksatz($TableUnformatedContentActive);
                                        break;

                                }
                                break;
                        }
                        
                    }
                    $TableUnformatedContentStyles.=$BorderTop.'\clpadft3\clpadt113';       
                    $TableUnformatedContentStyles.=$BorderLeft.'\clpadfl3\clpadl113';       
                    $TableUnformatedContentStyles.=$BorderRight.'\clpadrl3\clpadr113';       
                    $TableUnformatedContentStyles.=$BorderBottom.'\clpadfb3\clpadb113';       
                    $TableUnformatedContentStyles.='\cellx'.$index* Pixel2Twips(200);
                    $TableUnformatedContent.=$TableUnformatedContentActive;
                }
                //Ausgabe des Contents der Zellen
                $TableFormatedContent.=$TableUnformatedContentStyles.$TableUnformatedContent;
            }
        }
        $HTMLline=$TableFormatedContent;
    }
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
                    if(count($a)>1){
                        $Tag=trim($a[0]);
                        $Value=trim($a[1]);
                    }else{
                        $Tag=trim($a[0]);
                        $Value=null;
                    }
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

//Kontrolliert ob die Farbe schon mal vorgekommen ist, wenn nicht füge sie im Array an
function FarbenController($RGB,$FarbenArr){
    if(array_search($RGB, $FarbenArr)===false) $FarbenArr[]=$RGB;
    return $FarbenArr;
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