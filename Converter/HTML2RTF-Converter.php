<?php
function makeRTF($Info,$Schriftarten,$Color){
    $Deff= setDefinition($Info, $Schriftarten, $Color);
    $Standards='\deflang1031\plain\fs26\widowctrl\hyphauto\ftnbj';
    return '{\rtf1\ansi'.$Deff.$Standards.'}';
}
function setSchriftart($Schriftarten){
    $DefinitionSchriftarten='';
    for($i=0;$i<count($Schriftarten);$i++){
        $DefinitionSchriftarten.='{\f'.$i.' '.$Schriftarten[$i].';}';
    }
    return '{\fonttbl'.$DefinitionSchriftarten.'}';
}
function setColors($Color){
    $Farben='';
    for($i=0;$i<=count($Color);$i++){
        $Farben.='{\red'.$Color[$i]['red'].'\blue'.$Color[$i]['blue'].'\green'.$Color[$i]['green'].';}';
    }
    return '{\colortbl;'.$Farben.'}';
}
function setInformationen($Info){
    return '{\info{\title '.$Info['Titel'].'}{\author '.$Info['Author'].'}{\company '.$Info['Company'].'}{\creatim\yr'.$Info['Datum']->format('Y').'\mo'.$Info['Datum']->format('m').'\dy'.$Info['Datum']->format('d').'\hr'.$Info['Datum']->format('H').'\min'.$Info['Datum']->format('i').'}{\doccomm '.$Info['Kommentar'].'}}';
}
function setDefinition($Info,$Schriftarten,$Color){
    $SchriftartenDokument= setSchriftart($Schriftarten);
    $Farben= setColors($Color);
    $Dokumentinfo= setInformationen($Info);
    return '\deff0'.$SchriftartenDokument.$Farben.$Dokumentinfo;
}