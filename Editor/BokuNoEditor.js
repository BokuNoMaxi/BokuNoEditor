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
                    lastFocus.focus();
                    Button.toggleClass('bneActive'); 
                    var sel = window.getSelection(),
                        Markierung=sel.getRangeAt(0),
                        format=document.createElement('span');
                    //Formatiere Markiertes
                    if(Markierung.startOffset != Markierung.endOffset){//Text Formatierung
                        if(Button[0].id=='bokunoeditorToolbarKursiv'){
                            format.style.cssText=((Button.hasClass('bneActive'))?'font-style:italic;':'font-style:normal;');
                            Markierung.surroundContents(format);
                        }
                        if(Button[0].id=='bokunoeditorToolbarFett'){
                            format.style.cssText=((Button.hasClass('bneActive'))?'font-weight:bold;':'font-weight:normal;');
                            Markierung.surroundContents(format);
                        }
                    }else{
                        switch(Button[0].id){
                            case 'bokunoeditorToolbarKursiv':
                                format.style.cssText=((Button.hasClass('bneActive'))?'font-style:italic;':'font-style:normal');
                                Markierung.insertNode(format);
                                $(Markierung.startContainer.nextSibling).html('&#65279;');
                            break;
                            case 'bokunoeditorToolbarFett':
                                format.style.cssText=((Button.hasClass('bneActive'))?'font-weight:bold;':'font-weight:normal');
                                Markierung.insertNode(format);
                                $(Markierung.startContainer.nextSibling).html('&#65279;');
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
                    sel.removeAllRanges();
                    sel.addRange(Markierung);
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
                        Markierung=sel.getRangeAt(0).cloneRange(),
                        format=document.createElement('span');
                        ersetzeSelectedText(getSelectionText());
                        
                        
                    if(Markierung.startOffset != Markierung.endOffset){
                        switch (Select[0].id) {
                            case 'bokunoeditorSchriftgroesse':
                                format.style.cssText='font-size:'+Select.val()+'pt;';
                                Markierung.surroundContents(format);
                            break;
                            case 'bokunoeditorSchriftart':
                                format.style.cssText='font-family:'+Select.val()+';';
                                console.log($(Markierung.startContainer).siblings());
                                Markierung.surroundContents(format);
                            break;
                        }
                    }else{
                        switch (Select[0].id) {
                            case 'bokunoeditorSchriftgroesse':
                                format.style.cssText='font-size:'+Select.val()+'pt;';
                                Markierung.insertNode(format);
                                $(Markierung.startContainer.nextSibling).html('&#65279;');
                            break;
                            case 'bokunoeditorSchriftart':
                                format.style.cssText='font-family:'+Select.val()+';';
                                Markierung.insertNode(format);
                                $(Markierung.startContainer.nextSibling).html('&#65279;');
                            break;
                        }
                    }
                    sel.removeAllRanges();
                    sel.addRange(Markierung);    
                }, 10);
            }
        });
        // welche Formatierungen momentan aktiv sind im Dokument
        $('#bokunoeditorContent').on({'touchend':function(e){
                e.preventDefault();
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
                
            },'mouseup':function(e){
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
        function ersetzeSelectedText($Text){
            var sel, range,
                format=document.createElement('span'),
                text=$Text.split(/\n\r|\n|\r/g);
                console.log(text);
                $.each(text,function(index,value){
                    format.appendChild(document.createTextNode(value));
                    format.appendChild(document.createElement('br'));
                });
                console.log(format);
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(format);
                }
            } else if (document.selection && document.selection.createRange) {
                range = document.selection.createRange();
                range.text = $Text;
            }
        }
    };
    
}(jQuery));