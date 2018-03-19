<?php
function makeRTF($Info,$Schriftarten,$Color,$Content){
    $Deff= setDefinition($Info, $Schriftarten, $Color);
    $Standards='\deflang1031\plain\fs26\widowctrl\hyphauto\ftnbj';
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
    $Info['Datum']=DateTime::createFromFormat('Y.m.d H:i', $Info['Datum']);
    return '{\info{\title '.$Info['Titel'].'}{\author '.$Info['Author'].'}{\company '.$Info['Company'].'}{\creatim\yr'.$Info['Datum']->format('Y').'\mo'.$Info['Datum']->format('m').'\dy'.$Info['Datum']->format('d').'\hr'.$Info['Datum']->format('H').'\min'.$Info['Datum']->format('i').'}{\doccomm '.$Info['Kommentar'].'}}';
}
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
    return '\i '.$Text.'\i0';
}
function startFett(){
    return '\b ';
}
function stopFett(){
    return '\b0';
}
function setFett($Text){
    return '\b '.$Text.'\b0';
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
function makeGroup($Text){
    return '{'.$Text.'}';
}
function makeParagraph($Text){
    return'\pard '.$Text.'\par';
}