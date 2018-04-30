<?php
include('Konstanten.php');
include('RTF-Formatierung.php');
include('BokuNoEditorFunctions.php');

$Info= json_decode($_POST['Info'],TRUE);//Dokument Informationen
$HTML=trim(html_entity_decode ($_POST['Content']));//hole Content des Texteditors und bereite ihn auf für die formatierung
$Format=array('Seitenformat'=>trim($_POST['Format']),'Seitenverhaeltnis'=>$_POST['Seitenverhaeltnis']);
$RTF= makeRTF($Info,array_filter(explode(ParagraphEndTag, $HTML)),$Format);
    
createRTFFile($RTF);