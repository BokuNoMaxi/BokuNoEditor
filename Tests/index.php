<!Doctype html>
<html>
    <head>
        <meta name="viewport" content="initial-scale=1.0">
        <title>BokuNoEditor</title>
        <script src="../../jquery-3.1.1.js" type="text/javascript"></script>
        <link href="../Editor/BokuNoEditor.css" rel="stylesheet" type="text/css"/>
        <script src="../Editor/BokuNoEditor.js" type="text/javascript"></script>
        <script>
        $(document).ready(function(){
            $('#editor').bokunoeditor({
               'Title':'Nur zum Testen',
               'Author':'Maxl',
               'Kommentar':'das ist ein Test',
               'Company':'Maxls',
               'Datum':null
            }) ;
               
        });
        </script>
    </head>
    <body style="height: 100vh;margin: 5px;overflow:hidden;">
        <div style="height: calc(100% - 30px);">
            <input type="text" id="editor" value='<p class="bokunoeditorParagraph">erste zeile</p><p class="bokunoeditorParagraph">zweite zeile</p><p class="bokunoeditorParagraph">dritte zeile</p><p class="bokunoeditorParagraph">vierte zeile</p><p class="bokunoeditorParagraph">fünfte zeile</p><p class="bokunoeditorParagraph">sechste zeile</p><p class="bokunoeditorParagraph">siebte zeile</p><p class="bokunoeditorParagraph">achte zeile</p><p class="bokunoeditorParagraph">neunte zeile</p><p class="bokunoeditorParagraph">zehnte zeile</p><p class="bokunoeditorParagraph">elfte zeile</p><p class="bokunoeditorParagraph">zwölfte zeile</p><p class="bokunoeditorParagraph">dreizehnte zeile</p><p class="bokunoeditorParagraph">vierzehnte zeile</p><p class="bokunoeditorParagraph">fünfzehne zeile</p><p class="bokunoeditorParagraph">sechszehnte zeile</p><p class="bokunoeditorParagraph">siebzehnte zeile</p>'>
        </div>
    </body>
</html>