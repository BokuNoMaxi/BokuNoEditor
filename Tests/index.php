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
            <input type="text" id="editor" 
                 value='<p>erste zeile</p><p>zweite zeile</p><p>dritte zeile</p><p>vi<i>erte zei</i>le</p><p>fünfte zeile</p><p>sechste zeile</p><p>siebte zeile</p><p>achte zeile</p><p>neunte zeile</p><p>zehnte zeile</p><p>elfte zeile</p><p>zwölfte zeile</p><p>dreizehnte zeile</p><p>vierzehnte zeile</p><p>fünfzehne zeile</p><p>sechszehnte zeile</p><p>siebzehnte zeile</p>'
            >
               
        </div>
    </body>
</html>