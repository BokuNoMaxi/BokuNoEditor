(function($){
    var scripts = document.getElementsByTagName("script"),
        src = scripts[scripts.length-1].src,
        absolutPath=src.slice(0,src.slice(0,src.lastIndexOf('/')).lastIndexOf('/')),
        lastFocus=null,img=null,
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
        ],Menu='<button type="button" class="bokunoeditorMenueButton" id="bokunoeditorDatei">Datei</button><button type="button" class="bokunoeditorMenueButton" id="bokunoeditorSchrift">Schrift</button><button type="button" class="bokunoeditorMenueButton" id="bokunoeditorFormat">Format</button>'
        ,MenuContext='<div id="bokuenoeditorMenuDateiContextmenu" class="bokunoeditorContextMenu">\n\
                        <div id="bokuenoeditorMenuDateiContextmenuNeu" class="bneMenueTrennlinie"><button type="Button" class="bneMenuButton">Neu</button></div>\n\
                        <div id="bokuenoeditorMenuDateiContextmenuAbsenden"><button type="Button" class="bneMenuButton">Absenden</button></div>\n\
                        <div id="bokuenoeditorMenuDateiContextmenuDrucken"><button type="Button" class="bneMenuButton">Drucken</button></div>\n\
                    </div>'
        ,SchriftContext='<div id="bokuenoeditorMenuSchriftContextmenu" class="bokunoeditorContextMenu">\n\
                        <div id="bokuenoeditorMenuSchriftContextmenuArt"><span>Art:</span><select class="bokunoeditorToolbarSelect bokunoeditorSchriftart" id="bokunoeditorMenuSchriftart"></select></div>\n\
                        <div id="bokuenoeditorMenuSchriftContextmenuGroesse"><span>Gr\xF6\xDFe</span><select class="bokunoeditorToolbarSelect bokunoeditorSchriftgroesse" id="bokunoeditorMenuSchriftgroesse"></select></div>\n\
                    </div>'
        ,Toolbar='  <button type="button" class="bokunoeditorToolbarButton" id="bokunoeditorToolbarFett">B</button><button type="button" class="bokunoeditorToolbarButton" id="bokunoeditorToolbarKursiv">I</button><select class="bokunoeditorToolbarSelect bokunoeditorSchriftart" id="bokunoeditorToolbarSchriftart"></select><select class="bokunoeditorToolbarSelect bokunoeditorSchriftgroesse" id="bokunoeditorToolbarSchriftgroesse"></select><button class="bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung bneActive" id="bokunoeditorToolbarLinks" type="button">Links</button><button type="button" class="bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung" id="bokunoeditorToolbarMitte">Mitte</button><button type="button" class="bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung" id="bokunoeditorToolbarRechts">Rechts</button><button type="button" class="bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung" id="bokunoeditorToolbarBlock">Blocksatz</button><button type="button" class="bokunoeditorToolbarButton bokunoeditorToolbarTabelle" id="bokunoeditorTabelle">Tabelle</button><button type="button" class="bokunoeditorToolbarButton bokunoeditorToolbarBild" id="bokunoeditorBild">Bild</button>'
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
                            <div class="bokuenoeditorFormatZeileInput"><input type="color" class="bokuenoeditorFormatZeileInputColor bokunoeditorColorPicker" id="bokuenoeditorFormatZeileColor"></div>\n\
                        </div>\n\
                        <div class="bokuenoeditorFormatZeile bokunoeditorIMGFormats">\n\
                            <div class="bokuenoeditorFormatZeileInput">\n\
                                <div class="bokuenoeditorFormatZeilePreLabel">B:</div><input type="number" class="bokuenoeditorFormatZeileBreite bokunoeditorFormatZeileInput" id="bokuenoeditorFormatZeileIMGBreite"><div class="bokuenoeditorFormatZeileAppLabel">px</div> x\n\
                                <div class="bokuenoeditorFormatZeilePreLabel">H:</div><input type="number" class="bokuenoeditorFormatZeileHoehe bokunoeditorFormatZeileInput" id="bokuenoeditorFormatZeileIMGHoehe"><div class="bokuenoeditorFormatZeileAppLabel">px</div>\n\
                            </div>\n\
                        </div>\n\
                    </div>'
        ,borderStyles='border-top-style:solid;border-top-width:1px;border-left-style:solid;border-left-width:1px;border-bottom-style:solid;border-bottom-width:1px;border-right-style:solid;border-right-width:1px;';
    $.fn.bokunoeditor=function($Info,$rtfContent){//Initialisiere BokuNoEditor
        //$Info = Dokumentinformationen
        //$rtfContent = ist der Inhalt in der Box RTF oder HTML??
        var Textarea=$(this);
        //Vorbereitung des Editors
        $(Textarea).hide().parent().append('<div id="bokunoeditorIframe"><div id="bokunoeditorMenue"></div><div id="bokunoeditorToolbar"></div><div id="bokunoeditorContainer"><div id="bokunoeditorContent" class="A4"></div></div></div>');
        $('#bokunoeditorIframe').append(MenuContext+SchriftContext+FormatierungsZeile).append('<input type="file" hidden="hidden" id="fileUpload">');
        $('#bokunoeditorMenue').html(Menu);//Menüzeile
        $('#bokunoeditorToolbar').html(Toolbar);//Toolbar
        if($rtfContent===true){
            $.post(absolutPath+'/Converter/RTF2HTML-Converter.php',{
                'RTF':Textarea.val(),
            },function(data){
                lastFocus=$('#bokunoeditorContent').attr('contentEditable','true').html(data).focus();
            });
        }else{
            lastFocus=$('#bokunoeditorContent').attr('contentEditable','true').html($(Textarea).val()).focus();
        }
        
        
        //Zeige die Anzahl der Zeichen, Wörter die im Dokument vorhanden sind
        $('#bneAnzZeichen').text($('#bokunoeditorContent').text().length+' Zeichen,');
        $('#bneAnzWoerter').text($('#bokunoeditorContent')[0].innerText.split( /\s+/ ).filter(function(v){return v!==''}).length+' W\xF6rter');
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
        $('.bokunoeditorMenueButton').click(function(){
            var menu=$(this);
            switch(menu[0].id){
                case 'bokunoeditorDatei':
                    $('#bokuenoeditorMenuDateiContextmenu').toggleClass('bneOpen').siblings().removeClass('bneOpen');
                    break;
                case 'bokunoeditorSchrift':
                    $('#bokuenoeditorMenuSchriftContextmenu').toggleClass('bneOpen').siblings().removeClass('bneOpen');
                    break;
            }
        });
//        
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
            $('.bokunoeditorSchriftart').append('<option value="'+value+'">'+value+'</option>');
        });
        //Lade Schriftgr��e
        $.each(Schriftgroesse,function(index,value){
            $('.bokunoeditorSchriftgroesse').append('<option value="'+value+'" '+((value=='11')?'selected="selected"':'')+'>'+value+' pt</option>');
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
                        case 'bokunoeditorToolbarBlock':
                            $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                            Button.toggleClass('bneActive');
                            document.execCommand('justifyFull',false,null);
                            break;
                        case 'bokunoeditorTabelle':
                            document.execCommand('insertHTML',false,((sel.anchorNode.nodeName=='DIV')?'<table><tr style><td style="'+borderStyles+'">&#65279;</td><td style="'+borderStyles+'">&#65279;</td></tr></table><br>':'<div><table><tr style><td style="border:1px solid rgb(0,0,0);">&#65279;</td><td style="border:1px solid rgb(0,0,0);">&#65279;</td></tr></table><br>'));
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
                        case 'bokunoeditorMenuSchriftgroesse':
                        case 'bokunoeditorToolbarSchriftgroesse':
                            if(Markierung.startOffset != Markierung.endOffset){
                                ersetzeSelectedText(getSelectionText(),[{'formatierung':'font-size','value':Select.val()}]);
                            }else{
                                beginneNeueFormatierung([{'formatierung':'font-size','value':Select.val()}]);
                            }
                        break;
                        case 'bokunoeditorMenuSchriftart':
                        case 'bokunoeditorToolbarSchriftart':
                            document.execCommand('fontName',false,Select.val());
                        break;
                    }
                    $('.bokunoeditorContextMenu').removeClass('bneOpen');
                }, 10);
            }
        });
        // Extra Formatierungszeile f�r spezielle Formatierung
        $('.bokuenoeditorFormatZeileButton').click(function(){
            var Button=$(this);
            if(lastFocus){
                setTimeout(function() {
                    var sel = window.getSelection(),
                        Markierung=sel.getRangeAt(0);
                    lastFocus.focus();
                    switch(Button[0].id){
                        case 'bokuenoeditorFormatZeileAddRowRechts':
                            var td= $(sel.anchorNode).closest('td'),
                                tr=$(sel.anchorNode).closest('tr'),
                                indexTD=td.index(),
                                color=(td[0].style['border-top-color']);
                                $.each(tr.closest('table').find('tr'),function(index,trs){
                                    $(trs).children().eq(indexTD).after('<td style="'+borderStyles+'border-top-color'+color+';border-left-color'+color+';border-right-color'+color+';border-bottom-color'+color+';">&#65279;');
                                });
                            break;
                        case 'bokuenoeditorFormatZeileAddRowLinks':
                            var td= $(sel.anchorNode).closest('td'),
                                tr=$(sel.anchorNode).closest('tr'),
                                indexTD=td.index(),
                                color=(td[0].style['border-top-color']);
                                $.each(tr.closest('table').find('tr'),function(index,trs){
                                    $(trs).children().eq(indexTD).before('<td style="'+borderStyles+'border-top-color'+color+';border-left-color'+color+';border-right-color'+color+';border-bottom-color'+color+';">&#65279;');
                                });
                            break;
                        case 'bokuenoeditorFormatZeileAddRowUnten':
                            var tr=$(sel.anchorNode).closest('tr'),
                                td=$(sel.anchorNode).closest('td'),
                                color=(td[0].style['border-top-color']);
                            $.each(tr.children('td'),function(){
                               td+='<td style="'+borderStyles+'border-top-color'+color+';border-left-color'+color+';border-right-color'+color+';border-bottom-color'+color+';">&#65279;</td>'; 
                            });
                            tr.after('<tr>'+td+'</tr>');
                            break;
                        case 'bokuenoeditorFormatZeileAddRowOben':
                            var tr=$(sel.anchorNode).closest('tr'),
                                td=$(sel.anchorNode).closest('td'),
                                color=(td[0].style['border-top-color']);
                            $.each(tr.children('td'),function(){
                               td+='<td style="'+borderStyles+'border-top-color'+color+';border-left-color'+color+';border-right-color'+color+';border-bottom-color'+color+';">&#65279;</td>'; 
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
        //Colorpicker
        $('.bokunoeditorColorPicker').change(function(){
            var Button = $(this);
             if(lastFocus){
                setTimeout(function() {
                    var sel = window.getSelection(),
                        Markierung=sel.getRangeAt(0);
                    lastFocus.focus();
                    switch(Button[0].id){
                        case 'bokuenoeditorFormatZeileColor':
                            $(sel.anchorNode).closest('td').css({
                                'border-top-color':"rgb("+Button.val().match(/[A-Za-z0-9]{2}/g).map(function(v) { return parseInt(v, 16)}).join(",")+")",
                                'border-bottom-color':"rgb("+Button.val().match(/[A-Za-z0-9]{2}/g).map(function(v) { return parseInt(v, 16)}).join(",")+")",
                                'border-left-color':"rgb("+Button.val().match(/[A-Za-z0-9]{2}/g).map(function(v) { return parseInt(v, 16)}).join(",")+")",
                                'border-right-color':"rgb("+Button.val().match(/[A-Za-z0-9]{2}/g).map(function(v) { return parseInt(v, 16)}).join(",")+")"
                            });
                            break;
                    }
                },10);
            }
        });
        //SizeChanger
        $('.bokunoeditorFormatZeileInput').on('input',function(){
            var input=$(this);
            switch (input[0].id) {
                case 'bokuenoeditorFormatZeileIMGHoehe':
                    img.css('height',input.val());
                    break;
                case 'bokuenoeditorFormatZeileIMGBreite':
                    img.css('width',input.val());
                    break;
            }
        });
        // welche Formatierungen momentan aktiv sind im Dokument
        $('#bokunoeditorContent').on({'touchstart':function(e){
                $('.bokunoeditorContextMenu').removeClass('bneOpen');
                if(e.target.nodeName=='IMG'){
                    img=$(e.target);
                    img.addClass('bneFocus');
                    $('.bokunoeditorIMGFormats').css('display','inline-block');
                    $('#bokuenoeditorFormatZeileIMGBreite').val(parseInt($(e.target).css('width')));
                    $('#bokuenoeditorFormatZeileIMGHoehe').val(parseInt($(e.target).css('height')));
                }else{
                    if(img!==null)img.removeClass('bneFocus');
                    $('.bokunoeditorIMGFormats').css('display','none');
                }
                (($(e.target).closest('td').length>0)?$('.bokunoeditorTableFormats').css('display','inline-block'):$('.bokunoeditorTableFormats').css('display','none'));
                if($(e.target).closest('p').css('text-align')=='center'||$(e.target).closest('td').css('text-align')=='center'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarMitte').addClass('bneActive');
                }
                if($(e.target).closest('p').css('text-align')=='right'||$(e.target).closest('td').css('text-align')=='right'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarRechts').addClass('bneActive');
                }
                if($(e.target).closest('p').css('text-align')=='left'||$(e.target).closest('p').css('text-align')=='start'||$(e.target).closest('td').css('text-align')=='left'||$(e.target).closest('td').css('text-align')=='start'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarLinks').addClass('bneActive');
                }
                if($(e.target).closest('p').css('text-align')=='justify'||$(e.target).closest('td').css('text-align')=='justify'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarBlock').addClass('bneActive');
                }
                if($(e.target).css('font-style')=='italic')$('#bokunoeditorToolbarKursiv').addClass('bneActive');
                if($(e.target).css('font-style')=='normal')$('#bokunoeditorToolbarKursiv').removeClass('bneActive');
                if($(e.target).css('font-weight')=='700')$('#bokunoeditorToolbarFett').addClass('bneActive');
                if($(e.target).css('font-weight')=='400')$('#bokunoeditorToolbarFett').removeClass('bneActive');
                $('#bokunoeditorSchriftart option[value="'+$(e.target).css('font-family').replace(/\"/g,'')+'"]').prop('selected',true);
                $('#bokunoeditorSchriftgroesse option[value="'+Math.round(parseFloat($(e.target).css('font-size'))*72/96,1)+']').prop('selected',true);
                
            },'mousedown':function(e){
                $('.bokunoeditorContextMenu').removeClass('bneOpen');
                if(e.target.nodeName=='IMG'){
                    img=$(e.target);
                    img.addClass('bneFocus');
                    $('.bokunoeditorIMGFormats').css('display','inline-block');
                    $('#bokuenoeditorFormatZeileIMGBreite').val(parseInt(img.css('width')));
                    $('#bokuenoeditorFormatZeileIMGHoehe').val(parseInt(img.css('height')));
                }else{
                    if(img!==null)img.removeClass('bneFocus');
                    $('.bokunoeditorIMGFormats').css('display','none')
                }
                (($(e.target).closest('td').length>0)?$('.bokunoeditorTableFormats').css('display','inline-block'):$('.bokunoeditorTableFormats').css('display','none'));
                if($(e.target).closest('p').css('text-align')=='center'||$(e.target).closest('td').css('text-align')=='center'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarMitte').addClass('bneActive');
                }
                if($(e.target).closest('p').css('text-align')=='right'||$(e.target).closest('td').css('text-align')=='right'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarRechts').addClass('bneActive');
                }
                if($(e.target).closest('p').css('text-align')=='left'||$(e.target).closest('p').css('text-align')=='start'||$(e.target).closest('td').css('text-align')=='left'||$(e.target).closest('td').css('text-align')=='start'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarLinks').addClass('bneActive');
                }
                if($(e.target).closest('p').css('text-align')=='justify'||$(e.target).closest('td').css('text-align')=='justify'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('#bokunoeditorToolbarBlock').addClass('bneActive');
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
                $('#bneAnzWoerter').text($('#bokunoeditorContent')[0].innerText.split( /\s+/ ).filter(function(v){return v!==''}).length+' W\xF6rter');
            },'allowDrop':function(e){
//                e.preventDefault();
            },'dragover':function(e){
//                e.stopPropagation();
//                e.preventDefault();
            },'drop':function(e){
//                e.stopPropagation();
//                e.preventDefault();
//                var data = e.originalEvent.dataTransfer.getData("image");
//                $(e.target).append(data);
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
                var img = new Image();
                $(img).attr('src', e.target.result);
                img.onload=function(ev){
                    var width=this.width,
                        height=this.height;
                    $(this).css({'width':width,'height':height});
                    document.execCommand('insertHTML',false, $(img)[0].outerHTML);
                };
              $('img').unbind().on('dragstart',function(e){
//                  e.originalEvent.dataTransfer.setData("image", $(e.target)[0].outerHTML);
              });
            }
          reader.readAsDataURL(input.files[0]);
        }
    }
}(jQuery));