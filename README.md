# BokuNoEditor - der Editor der etwas anderen Art!

BokuNoEditor ist ein Editor der Anfangs nach nicht viel aussieht, jedoch sich als sehr mächtig herausstellt. Es ist der erste Editor der es schafft Content als RTF-Files abzuspeichern! Doch dass ist noch nicht alles! Auch das Laden von RTF-Files wird ermöglicht!
## Getting Started 
Um BokuNoEditor benutzen zu können wird JQuery benötigt! 

1.) BokuNoEditor.JS und BokuNoEditor.css includen 
2.) Initialisieren von BokuNoEditor
```
<script src="../../jquery-3.1.1.js" type="text/javascript"></script>
<link href="../Editor/BokuNoEditor.css" rel="stylesheet" type="text/css"/>
<script src="../Editor/BokuNoEditor.js" type="text/javascript"></script>
<script>
  $(document).ready(function(){
    $('#editor').bokunoeditor('init',
      {
        'info':{
          'Titel':'Nur zum Testen',
          'Author':'Maxl',
          'Kommentar':'das ist ein Test',
          'Organisation':'Maxls',
          'Datum':null
          },
        'rtfFile':$('#editor').data('rtffile')
      }
    ) ;
  });
</script>
```
BokuNoEditor kann jedes Element in einen Editor umwandeln. Es passt sich an die Größe des Containers an. Wenn man ein RTF-File angibt wird es geladen und in HTML übersetzt.
```
<input type="text" id="editor" data-rtffile='test.rtf'>
```

##Author
Markus Ketterer

##Lizenz
Dieses Programm ist unter der MIT Lizenz lizensiert
