<?php
function createRTFFile($RTFCode){
    $RTF= fopen('../FileOutput/Test.rtf', 'w');
    fwrite($RTF, $RTFCode);
    fclose($RTF);
}

