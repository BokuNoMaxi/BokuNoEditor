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
            $('#editor').bokunoeditor('init',
                {   'info':{
                        'Titel':'Nur zum Testen',
                        'Author':'Maxl',
                        'Kommentar':'das ist ein Test',
                        'Organisation':'Maxls',
                        'Datum':null
                    },
                    'rtfFile':$('#editor').val()
                }) ;
               
        });
        </script>
    </head>
    <body style="height: 100vh;margin: 5px;overflow:hidden;">
        <div style="height: calc(100% - 30px);">
            <input type="text" id="editor" value='test.rtf'>
        </div>
    </body>
</html>