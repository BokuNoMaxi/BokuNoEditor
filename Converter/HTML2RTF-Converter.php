<?php
include('Konstanten.php');
include('RTF-Formatierung.php');
include('BokuNoEditorFunctions.php');
include('Bilder.php');

$Info= json_decode($_POST['Info'],TRUE);//Dokument Informationen
//hole Content des Texteditors und bereite ihn auf für die formatierung
$HTML=trim(html_entity_decode ($_POST['Content']));
$HTMLSplit= array_filter(explode(ParagraphEndTag, $HTML));
$RTF= makeRTF($Info,$HTMLSplit);
    
createRTFFile($RTF);