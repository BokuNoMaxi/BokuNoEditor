(function($){
    var scripts = document.getElementsByTagName("script"),
        src = scripts[scripts.length-1].src,
        absolutPath=src.slice(0,src.slice(0,src.lastIndexOf('/')).lastIndexOf('/')),
        lastFocus,
        Schriftart=[
        'Arial','Arial Black',
        'Book Antiqua',
        'Comic Sans MS','Courier New',
        'Georgia',
        'Impact',
        'Lucida Console','Lucida Sans Unicode',
        'Palatino Linotype',
        'Tahoma','Times New Roman','Trebuchet MS',
        'Verdana',
        ],Schriftgroesse=[
            '6','7','8','9','10','10.5','11','12','13','14','15','16','18','20','22','24','26','28','32','36','40','44','48','54','60','66','72',
        ];
    
    $.fn.bokunoeditor=function($Info){//Initialisiere BokuNoEditor
        var Textarea=$(this);
        //Vorbereitung des Editors
        $(Textarea).hide().parent().append('<div id="bokunoeditorIframe"><div id="bokunoeditorMenue"></div><div id="bokunoeditorToolbar"></div><div id="bokunoeditorContent"></div></div>');
        $('#bokunoeditorIframe').append('<div id="bokuenoeditorMenuDateiContextmenu"><div id="bokuenoeditorMenuDateiContextmenuNeu"><button type="Button" class="bneMenuButton">Neu</button></div><div class="bneMenueTrennlinie"></div><div id="bokuenoeditorMenuDateiContextmenuAbsenden"><button type="Button" class="bneMenuButton">Absenden</button></div></div>');
        lastFocus=$('#bokunoeditorContent').attr('contentEditable','true').html($(Textarea).val());
        $('#bokunoeditorMenue').html('<button type="button" class="bokunoeditorMenueButton" id="bokunoeditorDatei">Datei</button><button type="button" class="bokunoeditorMenueButton">Schriftart</button><button type="button" class="bokunoeditorMenueButton">Format</button>');
        $('#bokunoeditorToolbar').html('<button type="button" class="bokunoeditorToolbarButton" id="bokunoeditorToolbarFett">B</button><button type="button" class="bokunoeditorToolbarButton" id="bokunoeditorToolbarKursiv">I</button><select class="bokunoeditorToolbarSelect" id="bokunoeditorSchriftart"></select><select class="bokunoeditorToolbarSelect" id="bokunoeditorSchriftgroesse"></select><button class="bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung bneActive" id="bokunoeditorToolbarLinks" type="button">Links</button><button type="button" class="bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung" id="bokunoeditorToolbarMitte">Mitte</button><button type="button" class="bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung" id="bokunoeditorToolbarRechts">Rechts</button>');
        
        //Speichern als RTF File
        $('#bokuenoeditorMenuDateiContextmenuAbsenden button').click(function(){
            $.post(absolutPath+'/Converter/HTML2RTF-Converter.php',{
                Content:$('#bokunoeditorContent').html(),
                Info:JSON.stringify($Info),
            },function(){
                
            });
        });
        //Kontextmenü
        $('#bokunoeditorDatei').click(function(){
            $('#bokuenoeditorMenuDateiContextmenu').toggleClass('bneOpen');
        });
        //wenn nichts importiert wird dann gib DIV vor
        (($('#bokunoeditorContent div').length===0)?$('#bokunoeditorContent').append('<p class="bokunoeditorParagraph"><br></p>'):'');
        //Lade Schriftarten
        $.each(Schriftart,function(index,value){
            $('#bokunoeditorSchriftart').append('<option value="'+value+'">'+value+'</option>');
        });
        //Lade Schriftgröße
        $.each(Schriftgroesse,function(index,value){
            $('#bokunoeditorSchriftgroesse').append('<option value="'+value+'" '+((value=='11')?'selected="selected"':'')+'>'+value+' pt</option>');
        });
        //Formatierung bei Knöpfen
        $('.bokunoeditorToolbarButton').click(function(){
            var Button=$(this);
            if(lastFocus){
                setTimeout(function() {
                    var sel = window.getSelection(),
                        Markierung=sel.getRangeAt(0);
                    lastFocus.focus();
                    Button.toggleClass('bneActive'); 
                    //Formatiere Markiertes
                    if(Markierung.startOffset != Markierung.endOffset){//Text Formatierung
                        if(Button[0].id=='bokunoeditorToolbarKursiv'){
                            ((Button.hasClass('bneActive'))?ersetzeSelectedText(getSelectionText(),[{'formatierung':'kkursiv','value':null}]):ersetzeSelectedText(getSelectionText(),[{'formatierung':'knormal','value':null}]));
                        }
                        if(Button[0].id=='bokunoeditorToolbarFett'){
                            ((Button.hasClass('bneActive'))?ersetzeSelectedText(getSelectionText(),[{'formatierung':'wbold','value':null}]):ersetzeSelectedText(getSelectionText(),[{'formatierung':'wnormal','value':null}]));
                        }
                    }else{
                        switch(Button[0].id){
                            case 'bokunoeditorToolbarKursiv':
                                ((Button.hasClass('bneActive'))?beginneNeueFormatierung([{'formatierung':'kkursiv','value':null}]):beginneNeueFormatierung([{'formatierung':'knormal','value':null}]));
                            break;
                            case 'bokunoeditorToolbarFett':
                                ((Button.hasClass('bneActive'))?beginneNeueFormatierung([{'formatierung':'wbold','value':null}]):beginneNeueFormatierung([{'formatierung':'wnormal','value':null}]));
                            break;   
                        }
                    }
                    //Formatiere den ganzen Absatz oder Ab den Punkt des Klickens
                    switch(Button[0].id){//Text Ausrichtung
                        case 'bokunoeditorToolbarLinks':
                            $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                            Button.addClass('bneActive');
                            $(Markierung.startContainer).closest('.bokunoeditorParagraph').css('text-align','left');
                        break;
                        case 'bokunoeditorToolbarMitte':
                            $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                            Button.addClass('bneActive');
                            $(Markierung.startContainer).closest('.bokunoeditorParagraph').css('text-align','center');
                        break;
                        case 'bokunoeditorToolbarRechts':
                            $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                            Button.addClass('bneActive');
                            $(Markierung.startContainer).closest('.bokunoeditorParagraph').css('text-align','right');
                        break;
                    }
                }, 10);
            }
        });
        //Formatierung bei Select Feldern
        $('.bokunoeditorToolbarSelect').change(function(e){
            var Select=$(this);
            if(lastFocus){
                setTimeout(function() {
                    lastFocus.focus();
                    var sel = window.getSelection(),
                        Markierung=sel.getRangeAt(0).cloneRange();
                    if(Markierung.startOffset != Markierung.endOffset){
                        switch (Select[0].id) {
                            case 'bokunoeditorSchriftgroesse':
                                ersetzeSelectedText(getSelectionText(),[{'formatierung':'font-size','value':Select.val()}]);
                            break;
                            case 'bokunoeditorSchriftart':
                                ersetzeSelectedText(getSelectionText(),[{'formatierung':'font-family','value':Select.val()}]);
                            break;
                        }
                    }else{
                        switch (Select[0].id) {
                            case 'bokunoeditorSchriftgroesse':
                                beginneNeueFormatierung([{'formatierung':'font-size','value':Select.val()}]);
                            break;
                            case 'bokunoeditorSchriftart':
                                beginneNeueFormatierung([{'formatierung':'font-family','value':Select.val()}]);
                            break;
                        }
                    }
                }, 10);
            }
        });
        // welche Formatierungen momentan aktiv sind im Dokument
        $('#bokunoeditorContent').on({'touchstart':function(e){
                if($(e.target).closest('.bokunoeditorParagraph').css('text-align')=='center'){
                    $('#bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarMitte').addClass('bneActive');
                }
                if($(e.target).closest('.bokunoeditorParagraph').css('text-align')=='right'){
                    $('#bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarRechts').addClass('bneActive');
                }
                if($(e.target).closest('.bokunoeditorParagraph').css('text-align')=='left'){
                    $('#bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarLinks').addClass('bneActive');
                }
                if($(e.target).css('font-style')=='italic')$('#bokunoeditorToolbarKursiv').addClass('bneActive');
                if($(e.target).css('font-style')=='normal')$('#bokunoeditorToolbarKursiv').removeClass('bneActive');
                if($(e.target).css('font-weight')=='700')$('#bokunoeditorToolbarFett').addClass('bneActive');
                if($(e.target).css('font-weight')=='400')$('#bokunoeditorToolbarFett').removeClass('bneActive');
                $('#bokunoeditorSchriftart option[value="'+$(e.target).css('font-family').replace(/\"/g,'')+'"]').prop('selected',true);
                $('#bokunoeditorSchriftgroesse option[value="'+Math.round(parseFloat($(e.target).css('font-size'))*72/96,1)+']').prop('selected',true);
                
            },'mousedown':function(e){
                if($(e.target).closest('.bokunoeditorParagraph').css('text-align')=='center'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarMitte').addClass('bneActive');
                }
                if($(e.target).closest('.bokunoeditorParagraph').css('text-align')=='right'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarRechts').addClass('bneActive');
                }
                if($(e.target).closest('.bokunoeditorParagraph').css('text-align')=='left'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarLinks').addClass('bneActive');
                }
                if($(e.target).css('font-style')=='italic')$('#bokunoeditorToolbarKursiv').addClass('bneActive');
                if($(e.target).css('font-style')=='normal')$('#bokunoeditorToolbarKursiv').removeClass('bneActive');
                if($(e.target).css('font-weight')=='700')$('#bokunoeditorToolbarFett').addClass('bneActive');
                if($(e.target).css('font-weight')=='400')$('#bokunoeditorToolbarFett').removeClass('bneActive');
                $('#bokunoeditorSchriftart option[value="'+$(e.target).css('font-family').replace(/\"/g,'')+'"]').prop('selected',true);
                $('#bokunoeditorSchriftgroesse option[value="'+Math.round(parseFloat($(e.target).css('font-size'))*72/96,1)+']').prop('selected',true);
                
            }
        });
        //Fokus zurück zum Editor
        $('#bokunoeditorContent').on('blur',function(){//damit der Cursor wieder im Editor ist
            lastFocus=this;
        });
        //Text ersetzungs Funktion
        function getSelectionText() {
            var text = "";
            if (window.getSelection) {
                text = window.getSelection().toString();
            } else if (document.selection && document.selection.type != "Control") {
                text = document.selection.createRange().text;
            }
            return text;
        }
        function ersetzeSelectedText($Text,$format){
            var sel, range, startOffset, endOffset,
                format=setFormatierung($format),
                text=$Text.split(/(\n\n)/gm);
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    startOffset=range.startOffset;
                    endOffset=range.endOffset;
                    range.deleteContents();
                    if(text.length==1){
                        format.appendChild(document.createTextNode(text[0]));
                        range.insertNode(format);
                    }else{
                        $.each(text,function(index,value){
                            if(value!='\n\n'){
                                format.appendChild(document.createTextNode(value));
                            }
                        });
                    }
                }
            } else if (document.selection && document.selection.createRange) {
                range = document.selection.createRange();
                range.text = $Text;
            }
        }
        //Formatierung startet ab jetzt
        function beginneNeueFormatierung($format){
            var sel = window.getSelection(),
                Markierung=sel.getRangeAt(0),
                format=setFormatierung($format);
            Markierung.insertNode(format);
            $(Markierung.startContainer.nextSibling).html('&#65279;');
        }
        //setze Formatierung für den aktuellen
        function setFormatierung($format){
            var format=document.createElement('span');
            $.each($format,function(index,value){
                switch(value['formatierung']){
                    case 'kkursiv':
                        format.style.cssText='font-style:italic;';
                        break;
                    case 'knormal':
                        format.style.cssText='font-style:normal;';
                    break;
                    case 'wbold':
                        format.style.cssText='font-weight:700;';
                    break;
                    case 'wnormal':
                        format.style.cssText='font-weight:400;';
                    break;
                    case 'font-size':
                        format.style.cssText='font-size:'+value['value']+'pt;';
                        break;
                    case 'font-family':
                        format.style.cssText='font-family:'+value['value']+'pt;';
                    break;
                }
            });
            return format;
        }
    };
    
}(jQuery));