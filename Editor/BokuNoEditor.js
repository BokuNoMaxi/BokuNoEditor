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
            '6','7','8','9','10','11','12','13','14','15','16','18','20','22','24','26','28','32','36','40','44','48','54','60','66','72',
        ],Menu='<button type="button" class="bokunoeditorMenueButton" id="bokunoeditorDatei">Datei</button>\n\
                <button type="button" class="bokunoeditorMenueButton">Schriftart</button>\n\
                <button type="button" class="bokunoeditorMenueButton">Format</button>'
        ,MenuDatei='<div id="bokuenoeditorMenuDateiContextmenu">\n\
                        <div id="bokuenoeditorMenuDateiContextmenuNeu"><button type="Button" class="bneMenuButton">Neu</button></div>\n\
                        <div class="bneMenueTrennlinie"></div>\n\
                        <div id="bokuenoeditorMenuDateiContextmenuAbsenden"><button type="Button" class="bneMenuButton">Absenden</button></div>\n\
                        <div id="bokuenoeditorMenuDateiContextmenuDrucken"><button type="Button" class="bneMenuButton">Drucken</button></div>\n\
                    </div>'
        ,Toolbar='  <button type="button" class="bokunoeditorToolbarButton" id="bokunoeditorToolbarFett">B</button>\n\
                    <button type="button" class="bokunoeditorToolbarButton" id="bokunoeditorToolbarKursiv">I</button>\n\
                    <select class="bokunoeditorToolbarSelect" id="bokunoeditorSchriftart"></select>\n\
                    <select class="bokunoeditorToolbarSelect" id="bokunoeditorSchriftgroesse"></select>\n\
                    <button class="bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung bneActive" id="bokunoeditorToolbarLinks" type="button">Links</button>\n\
                    <button type="button" class="bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung" id="bokunoeditorToolbarMitte">Mitte</button>\n\
                    <button type="button" class="bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung" id="bokunoeditorToolbarRechts">Rechts</button>\n\
                    <button type="button" class="bokunoeditorToolbarButton bokunoeditorToolbarTabelle" id="bokunoeditorTabelle">Tabelle</button>\n\
                    <button type="button" class="bokunoeditorToolbarButton bokunoeditorToolbarBild" id="bokunoeditorBild">Bild</button>'
        ,FormatierungsZeile='<div id="bokuenoeditorFormatZeileContainer">\n\
                        <div class="bokuenoeditorFormatZeile bokunoeditorDokInfos">\n\
                            <span id="bneAnzZeichen"></span>\n\
                            <span id="bneAnzWoerter"></span>\n\
                        </div>\n\
                        <div class="bokuenoeditorFormatZeile bokunoeditorTableFormats">\n\
                            <button type="Button" class="bokuenoeditorFormatZeileButton" id="bokuenoeditorFormatZeileAddRowRechts">AddRe</button>\n\
                            <button type="Button" class="bokuenoeditorFormatZeileButton" id="bokuenoeditorFormatZeileAddRowLinks">AddLi</button>\n\
                            <button type="Button" class="bokuenoeditorFormatZeileButton" id="bokuenoeditorFormatZeileAddRowOben">AddOb</button>\n\
                            <button type="Button" class="bokuenoeditorFormatZeileButton" id="bokuenoeditorFormatZeileAddRowUnten">AddUn</button>\n\
                            <button type="Button" class="bokuenoeditorFormatZeileButton" id="bokuenoeditorFormatZeileDelRowRechts">DelRe</button>\n\
                            <button type="Button" class="bokuenoeditorFormatZeileButton" id="bokuenoeditorFormatZeileDelRowLinks">DelLi</button>\n\
                            <button type="Button" class="bokuenoeditorFormatZeileButton" id="bokuenoeditorFormatZeileDelRowOben">DelOb</button>\n\
                            <button type="Button" class="bokuenoeditorFormatZeileButton" id="bokuenoeditorFormatZeileDelRowUnten">DelUn</button>\n\
                        </div>\n\
                    </div>';
    
    $.fn.bokunoeditor=function($Info){//Initialisiere BokuNoEditor
        var Textarea=$(this);
        //Vorbereitung des Editors
        $(Textarea).hide().parent().append('<div id="bokunoeditorIframe"><div id="bokunoeditorMenue"></div><div id="bokunoeditorToolbar"></div><div id="bokunoeditorContainer"><div id="bokunoeditorContent" class="A4" style="border: solid 2cm rgba(0, 0, 0, 0);"></div></div></div>');
        $('#bokunoeditorIframe').append(MenuDatei).append(FormatierungsZeile).append('<input type="file" hidden="hidden" id="fileUpload">');
        lastFocus=$('#bokunoeditorContent').attr('contentEditable','true').html($(Textarea).val()).focus();
        $('#bokunoeditorMenue').html(Menu);//Menüzeile
        $('#bokunoeditorToolbar').html(Toolbar);//Toolbar
        //Zeige die Anzahl der Zeichen, Wörter die im Dokument vorhanden sind
        $('#bneAnzZeichen').text($('#bokunoeditorContent').text().length+' Zeichen,');
        $('#bneAnzWoerter').text($('#bokunoeditorContent')[0].innerText.split( /\s+/ ).filter(function(v){return v!==''}).length+' Wörter');
        //Speichern als RTF File
        $('#bokuenoeditorMenuDateiContextmenuAbsenden button').click(function(){
            $('b,i').removeAttr('style');
            $.post(absolutPath+'/Converter/HTML2RTF-Converter.php',{
                Content:$('#bokunoeditorContent').html(),
                Info:JSON.stringify($Info),
                Format:$('#bokunoeditorContent').attr('class'),
                Seitenverhaeltnis:{'l':$('#bokunoeditorContent').css('border-left-width'),'r':$('#bokunoeditorContent').css('border-right-width'),'t':$('#bokunoeditorContent').css('border-top-width'),'b':$('#bokunoeditorContent').css('border-bottom-width')},
                
            },function(){});
        });
        //Kontextmen�
        $('#bokunoeditorDatei').click(function(){
            $('#bokuenoeditorMenuDateiContextmenu').toggleClass('bneOpen');
        });
        //Drucken
        $('#bokuenoeditorMenuDateiContextmenuDrucken').click(function(){
            drucken();
        });
        //Bilder
        $('#fileUpload').change(function(){
            readURL(this);
        });
        //wenn nichts importiert wird dann gib DIV vor
        (($('#bokunoeditorContent div').length===0)?$('#bokunoeditorContent').append('<div><br></div>'):'');
        //Lade Schriftarten
        $.each(Schriftart,function(index,value){
            $('#bokunoeditorSchriftart').append('<option value="'+value+'">'+value+'</option>');
        });
        //Lade Schriftgr��e
        $.each(Schriftgroesse,function(index,value){
            $('#bokunoeditorSchriftgroesse').append('<option value="'+value+'" '+((value=='11')?'selected="selected"':'')+'>'+value+' pt</option>');
        });
        //Formatierung bei Kn�pfen
        $('.bokunoeditorToolbarButton').click(function(){
            var Button=$(this),
            sel=window.getSelection();
            if(lastFocus){
                setTimeout(function() {
                    var sel = window.getSelection(),
                        Markierung=sel.getRangeAt(0);
                    lastFocus.focus();
                    switch(Button[0].id){
                        case 'bokunoeditorToolbarKursiv':
                            Button.toggleClass('bneActive');
                            document.execCommand('italic',false,null);
                            break;
                        case 'bokunoeditorToolbarFett':
                            Button.toggleClass('bneActive');
                            document.execCommand('bold',false,null);
                            break;
                        case 'bokunoeditorToolbarLinks':
                            $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                            Button.toggleClass('bneActive');
                            document.execCommand('justifyLeft',false,null);
                            break;
                        case 'bokunoeditorToolbarMitte':
                            $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                            Button.toggleClass('bneActive');
                            document.execCommand('justifyCenter',false,null);
                            break;
                        case 'bokunoeditorToolbarRechts':
                            $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                            Button.toggleClass('bneActive');
                            document.execCommand('justifyRight',false,null);
                            break;
                        case 'bokunoeditorTabelle':
                            document.execCommand('insertHTML',false,((sel.anchorNode.nodeName=='DIV')?'<table><tr><td><td></tr></table><br>':'<div><table><tr><td><td></tr></table><br>'));
                            break;
                        case 'bokunoeditorBild':
                            $('#fileUpload').click();
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
                    switch (Select[0].id) {
                        case 'bokunoeditorSchriftgroesse':
                            if(Markierung.startOffset != Markierung.endOffset){
                                ersetzeSelectedText(getSelectionText(),[{'formatierung':'font-size','value':Select.val()}]);
                            }else{
                                beginneNeueFormatierung([{'formatierung':'font-size','value':Select.val()}]);
                            }
                        break;
                        case 'bokunoeditorSchriftart':
                            document.execCommand('fontName',false,Select.val());
                        break;
                    }
                }, 10);
            }
        });
        // Extra Formatierungszeile f�r spezielle Formatierung
        $('.bokuenoeditorFormatZeileButton').click(function(){
            var Button=$(this),
            sel=window.getSelection();
            if(lastFocus){
                setTimeout(function() {
                    var sel = window.getSelection(),
                        Markierung=sel.getRangeAt(0);
                    lastFocus.focus();
                    switch(Button[0].id){
                        case 'bokuenoeditorFormatZeileAddRowRechts':
                            var td= $(sel.anchorNode).closest('td'),
                                tr=$(sel.anchorNode).closest('tr'),
                                indexTD=td.index();
                                $.each(tr.closest('table').find('tr'),function(index,trs){
                                    $(trs).children().eq(indexTD).after('<td>');
                                });
                            break;
                        case 'bokuenoeditorFormatZeileAddRowLinks':
                            var td= $(sel.anchorNode).closest('td'),
                                tr=$(sel.anchorNode).closest('tr'),
                                indexTD=td.index();
                                $.each(tr.closest('table').find('tr'),function(index,trs){
                                    $(trs).children().eq(indexTD).before('<td>');
                                });
                            break;
                        case 'bokuenoeditorFormatZeileAddRowUnten':
                            var tr=$(sel.anchorNode).closest('tr'),
                                td;
                            $.each(tr.children('td'),function(){
                               td+='<td></td>'; 
                            });
                            tr.after('<tr>'+td+'</tr>');
                            break;
                        case 'bokuenoeditorFormatZeileAddRowOben':
                            var tr=$(sel.anchorNode).closest('tr'),
                                td;
                            $.each(tr.children('td'),function(){
                               td+='<td></td>'; 
                            });
                            tr.before('<tr>'+td+'</tr>');
                            break;
                        case 'bokuenoeditorFormatZeileDelRowRechts':
                            var td= $(sel.anchorNode).closest('td'),
                                tr=$(sel.anchorNode).closest('tr'),
                                indexTD=td.index();
                                $.each(tr.closest('table').find('tr'),function(index,trs){
                                    $(trs).children().eq(indexTD+1).remove();
                                });
                            break;
                        case 'bokuenoeditorFormatZeileDelRowLinks':
                            var td= $(sel.anchorNode).closest('td'),
                                tr=$(sel.anchorNode).closest('tr'),
                                indexTD=td.index();
                                $.each(tr.closest('table').find('tr'),function(index,trs){
                                    $(trs).children().eq(indexTD-1).remove();
                                });
                            break;
                        case 'bokuenoeditorFormatZeileDelRowUnten':
                            var tr=$(sel.anchorNode).closest('tr');
                            tr.next('tr').remove();
                            break;
                        case 'bokuenoeditorFormatZeileDelRowOben':
                            var tr=$(sel.anchorNode).closest('tr');
                            tr.prev('tr').remove();
                            break;
                    }
                },10);
            }
        });
        // welche Formatierungen momentan aktiv sind im Dokument
        $('#bokunoeditorContent').on({'touchstart':function(e){
                (($(e.target).closest('td').length>0)?$('.bokunoeditorTableFormats').css('display','inline-block'):$('.bokunoeditorTableFormats').css('display','none'));
                if($(e.target).closest('p').css('text-align')=='center'){
                    $('#bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarMitte').addClass('bneActive');
                }
                if($(e.target).closest('p').css('text-align')=='right'){
                    $('#bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarRechts').addClass('bneActive');
                }
                if($(e.target).closest('p').css('text-align')=='left'||$(e.target).closest('p').css('text-align')=='start'){
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
                (($(e.target).closest('td').length>0)?$('.bokunoeditorTableFormats').css('display','inline-block'):$('.bokunoeditorTableFormats').css('display','none'));
                if($(e.target).closest('p').css('text-align')=='center'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarMitte').addClass('bneActive');
                }
                if($(e.target).closest('p').css('text-align')=='right'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarRechts').addClass('bneActive');
                }
                if($(e.target).closest('p').css('text-align')=='left'||$(e.target).closest('p').css('text-align')=='start'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarLinks').addClass('bneActive');
                }
                if($(e.target).css('font-style')=='italic')$('#bokunoeditorToolbarKursiv').addClass('bneActive');
                if($(e.target).css('font-style')=='normal')$('#bokunoeditorToolbarKursiv').removeClass('bneActive');
                if($(e.target).css('font-weight')=='700')$('#bokunoeditorToolbarFett').addClass('bneActive');
                if($(e.target).css('font-weight')=='400')$('#bokunoeditorToolbarFett').removeClass('bneActive');
                $('#bokunoeditorSchriftart option[value="'+$(e.target).css('font-family').replace(/\"/g,'')+'"]').prop('selected',true);
                $('#bokunoeditorSchriftgroesse option[value="'+Math.round(parseFloat($(e.target).css('font-size'))*72/96,1)+'"]').prop('selected',true);
            },'blur':function(){//Fokus zur�ck zum Editor
                lastFocus=this;
            },'keydown':function(e){
                if (e.keyCode === 13) {
                    e.preventDefault;
                    document.execCommand("defaultParagraphSeparator", false, "div");
                }
            },'keyup':function(){
                $('#bneAnzZeichen').text($('#bokunoeditorContent').text().length+' Zeichen,');
                $('#bneAnzWoerter').text($('#bokunoeditorContent')[0].innerText.split( /\s+/ ).filter(function(v){return v!==''}).length+' Wörter');
            },'allowDrop':function(e){
                e.preventDefault();
            },'dragover':function(e){
                e.stopPropagation();
                e.preventDefault();
            },'drop':function(e){
                e.stopPropagation();
                e.preventDefault();
                var data = e.originalEvent.dataTransfer.getData("image");
                document.execCommand('insertHTML',false, data);
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
                    oldContent.find('p').wrapInner(format);//umschlie�e den selected Text mit der Formatierung
                    //kombiniere die zeile vorher und nachher 
                    startContent=$('p').eq(range.startOffset-1).html()+oldContent.find('p').first().html();
                    endContent=oldContent.find('p').last().html()+$('p').eq(range.startOffset).html();
                    //Die kombinierte Zeile als erstes und Letztes Objekt im document fragment  
                    oldContent.find('p').first().html(startContent);
                    oldContent.find('p').last().html(endContent);
                    //entferne nicht ben�tigte Objekte
                    $('p').eq(range.startOffset).prev().remove();
                    $('p').eq(range.startOffset).remove();
                    oldContent.find('p span:empty').remove();
                    
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
        if(Markierung.startContainer.nodeName!='P'){
            Markierung.insertNode(format);
            $(Markierung.startContainer.nextSibling).html('&#65279;');
        }
    }
    //setze Formatierung
    function setFormatierung($format,$documentFragment){
        var format=document.createElement('span'),
            sel = window.getSelection(),
            Markierung=sel.getRangeAt(0);
        $.each($format,function(index,value){
            switch(value['formatierung']){
                case 'font-size':
                    if(Markierung.startContainer.nodeName=='P'){
                        $(Markierung.startContainer).css('font-size',value['value']+'pt');
                    }else{
                        if($documentFragment!==null)$documentFragment.find('span[style^="font-size:"]').css('font-size','');
                        format.style.cssText='font-size:'+value['value']+'pt;';
                    }
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
    function readURL(input) {
        if (input.files && input.files[0]) {
          var reader = new FileReader();
          reader.onload = function(e) {
              var img = document.createElement('img');
              $(img).attr('src', e.target.result).attr('draggable', 'true');
              document.execCommand('insertHTML',false, $(img)[0].outerHTML);
              $('img').unbind().on('dragstart',function(e){
                  drag(e);
              });
          }
          reader.readAsDataURL(input.files[0]);
        }
      }
    function drag(e){
        e.originalEvent.dataTransfer.setData("image", $(e.target)[0].outerHTML);
    }
}(jQuery));