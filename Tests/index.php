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
                 value='<div>erste zeile</div><div>zweite zeile</div><div>dritte zeile</div><div>vi<i>erte zei</i>le</div><div>fünfte zeile</div><div>sechste zeile</div><div>siebte zeile</div><div>achte zeile</div><div>neunte zeile</div><div>zehnte zeile</div><div>elfte zeile</div><div>zwölfte zeile</div><div>dreizehnte zeile</div><div>vierzehnte zeile</div><div>fünfzehne zeile</div><div>sechszehnte zeile</div><div>siebzehnte zeile</div>'
            >
               
        </div>
    </body>
</html>