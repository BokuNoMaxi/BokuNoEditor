<!Doctype html>
<html>
    <head>
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
            <input type="text" id="editor">
        </div>
    </body>
</html>