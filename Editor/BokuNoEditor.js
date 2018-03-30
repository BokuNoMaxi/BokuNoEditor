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
        $('#bokunoeditorIframe').append('<div id="bokuenoeditorMenuDateiContextmenu"><div id="bokuenoeditorMenuDateiContextmenuNeu"><button type="Button" class="bneMenuButton">Neu</button></div><div class="bneMenueTrennlinie"></div><div id="bokuenoeditorMenuDateiContextmenuAbsenden"><button type="Button" class="bneMenuButton">Absenden</button></div><div id="bokuenoeditorMenuDateiContextmenuDrucken"><button type="Button" class="bneMenuButton">Drucken</button></div></div>');
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
        //Drucken
        $('#bokuenoeditorMenuDateiContextmenuDrucken').click(function(){
            drucken();
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
                $('#bokunoeditorSchriftgroesse option[value="'+Math.round(parseFloat($(e.target).css('font-size'))*72/96,1)+'"]').prop('selected',true);
                
            },'blur':function(){//Fokus zurück zum Editor
                lastFocus=this;
            },'keydown':function(e){
                if (e.keyCode === 13) {
                    e.preventDefault;
                    document.execCommand("defaultParagraphSeparator", false, "p");
//                    document.execCommand("insertHTML", false, "<div class='bokunoeditorParagraph'>ok</div>");
                    
                }
            }
        });
    };
    //Text ersetzungs Funktion
    function getSelectionText() {//return den selected text
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    }
    function ersetzeSelectedText($Text,$format){//ersetzen des Textes durch Formatierungen
        var sel, range, startOffset,oldContent,startContent,endContent,
            text=$Text.split(/(\n\n)/gm).filter(filterArrayCR);
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0);
                oldContent=$(range.extractContents());
                var format=setFormatierung($format,oldContent);
                if(oldContent.children().length>0){//Mehrzeilige Formatierung
                    oldContent.find('.bokunoeditorParagraph').wrapInner(format);//umschließe den selected Text mit der Formatierung
                    //kombiniere die zeile vorher und nachher 
                    startContent=$('.bokunoeditorParagraph').eq(range.startOffset-1).html()+oldContent.find('.bokunoeditorParagraph').first().html();
                    endContent=oldContent.find('.bokunoeditorParagraph').last().html()+$('.bokunoeditorParagraph').eq(range.startOffset).html();
                    //Die kombinierte Zeile als erstes und Letztes Objekt im document fragment  
                    oldContent.find('.bokunoeditorParagraph').first().html(startContent);
                    oldContent.find('.bokunoeditorParagraph').last().html(endContent);
                    //entferne nicht benötigte Objekte
                    $('.bokunoeditorParagraph').eq(range.startOffset).prev().remove();
                    $('.bokunoeditorParagraph').eq(range.startOffset).remove();
                    oldContent.find('.bokunoeditorParagraph span:empty').remove();
                    
                    range.insertNode(oldContent[0]);
                }else{//Single Line Formatierung
                    format.append(oldContent.text());
                    range.insertNode(format);
                }
//                range.insertNode(oldContent[0]);
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
            format=setFormatierung($format,null);
        Markierung.insertNode(format);
        $(Markierung.startContainer.nextSibling).html('&#65279;');
    }
    //setze Formatierung
    function setFormatierung($format,$documentFragment){
        var format=document.createElement('span');
        $.each($format,function(index,value){
            switch(value['formatierung']){
                case 'kkursiv':
                    if($documentFragment!==null){
                        $.each($documentFragment.find('span[style^="font-style"]'),function(index,value){
                            $(value).css('font-style','');
                        });
                    }
                    format.style.cssText='font-style:italic;';
                    break;
                case 'knormal':
                    if($documentFragment!==null){
                        $.each($documentFragment.find('span[style^="font-style"]'),function(index,value){
                            $(value).css('font-style','');
                        });
                    }
                    format.style.cssText='font-style:normal;';
                break;
                case 'wbold':
                    if($documentFragment!==null)$documentFragment.find('span[style^="font-weight:400"]').css('font-weight','');
                    format.style.cssText='font-weight:700;';
                break;
                case 'wnormal':
                    if($documentFragment!==null)$documentFragment.find('span[style^="font-weight:700"]').css('font-weight','');
                    format.style.cssText='font-weight:400;';
                break;
                case 'font-size':
                    if($documentFragment!==null)$documentFragment.find('span[style^="font-size:"]').css('font-size','');
                    format.style.cssText='font-size:'+value['value']+'pt;';
                    break;
                case 'font-family':
                    if($documentFragment!==null)$documentFragment.find('span[style^="font-family:"]').css('font-family','');
                    format.style.cssText='font-family:'+value['value']+'pt;';
                break;
            }
        });
        return format;
    }
    function filterArrayCR(text){
        return text !='\n\n';
    }
    function drucken(){
        var w=window.open();
        w.document.write($('#bokunoeditorContent').html());
        w.print();
        w.close();
    }
}(jQuery));