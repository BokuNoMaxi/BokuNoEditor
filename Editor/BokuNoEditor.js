(function($){
    var scripts = document.getElementsByTagName("script"),
        kursiv=document.createElement('em'),
        fett=document.createElement('strong'),
        schrift=document.createElement('span'),
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
    
    $.fn.bokunoeditor=function($Info){
        var Textarea=$(this);
        $(Textarea).hide().parent().append('<div id="bokunoeditorIframe"><div id="bokunoeditorMenue"></div><div id="bokunoeditorToolbar"></div><div id="bokunoeditorContent"></div></div>');
        $('#bokunoeditorIframe').append('<div id="bokuenoeditorMenuDateiContextmenu"><div id="bokuenoeditorMenuDateiContextmenuNeu"><button type="Button" class="bneMenuButton">Neu</button></div><div class="bneMenueTrennlinie"></div><div id="bokuenoeditorMenuDateiContextmenuAbsenden"><button type="Button" class="bneMenuButton">Absenden</button></div></div>')
        lastFocus=$('#bokunoeditorContent').attr('contentEditable','true').html($(Textarea).val());
        $('#bokunoeditorMenue').html('<button type="button" class="bokunoeditorMenueButton" id="bokunoeditorDatei">Datei</button><button type="button" class="bokunoeditorMenueButton">Schriftart</button><button type="button" class="bokunoeditorMenueButton">Format</button>');
        $('#bokunoeditorToolbar').html('<button type="button" class="bokunoeditorToolbarButton" id="bokunoeditorToolbarFett">B</button><button type="button" class="bokunoeditorToolbarButton" id="bokunoeditorToolbarKursiv">I</button><select class="bokunoeditorToolbarSelect" id="bokunoeditorSchriftart"></select><select class="bokunoeditorToolbarSelect" id="bokunoeditorSchriftgroesse"></select><button class="bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung" id="bokunoeditorToolbarLinks" type="button">Links</button><button type="button" class="bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung" id="bokunoeditorToolbarMitte">Mitte</button><button type="button" class="bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung" id="bokunoeditorToolbarRechts">Rechts</button>');
        
        $('#bokuenoeditorMenuDateiContextmenuAbsenden button').click(function(){
            $.post(absolutPath+'/Converter/HTML2RTF-Converter.php',{
                Content:$('#bokunoeditorContent').html(),
                Info:JSON.stringify($Info),
            },function(){
                
            });
        });
        $('#bokunoeditorDatei').click(function(){
            $('#bokuenoeditorMenuDateiContextmenu').toggleClass('bneOpen');
        });
        (($('#bokunoeditorContent div').length===0)?$('#bokunoeditorContent').append('<div></div>'):'');
        $.each(Schriftart,function(index,value){
            $('#bokunoeditorSchriftart').append('<option value="'+value+'">'+value+'</option>');
        });
        $.each(Schriftgroesse,function(index,value){
            $('#bokunoeditorSchriftgroesse').append('<option value="'+value+'" '+((value=='11')?'selected="selected"':'')+'>'+value+' pt</option>');
        });
        
        $('.bokunoeditorToolbarButton').click(function(){
            var Button=$(this);
            if(lastFocus){
                setTimeout(function() {
                    lastFocus.focus();
                    Button.toggleClass('bneActive'); 
                    var sel = window.getSelection(),
                        Zeile = sel.focusNode.data,
                        Markierung=sel.getRangeAt(0).cloneRange(),
                        referenceNode;
                    
                    //Formatiere ab jetzt
                    
                    
                    //Formatiere Markiertes
                    if(Markierung.startOffset != Markierung.endOffset){//Text Formatierung
                        if(Button[0].id=='bokunoeditorToolbarKursiv'){
                            Markierung.surroundContents(kursiv);
                        }
                        if(Button[0].id=='bokunoeditorToolbarFett'){
                            Markierung.surroundContents(fett);
                        }
                    }
                    //Formatiere den ganzen Absatz oder Ab den Punkt des Klickens
                    switch(Button[0]){//Text Ausrichtung
                        case bokunoeditorToolbarLinks:
                            $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                            Button.addClass('bneActive');
                            $(Markierung.startContainer.parentElement).css('text-align','left');
                        break;
                        case bokunoeditorToolbarMitte:
                            $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                            Button.addClass('bneActive');
                            $(Markierung.startContainer.parentElement).css('text-align','center');
                        break;
                        case bokunoeditorToolbarRechts:
                            $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                            Button.addClass('bneActive');
                            $(Markierung.startContainer.parentElement).css('text-align','right');
                        break;
                        case bokunoeditorToolbarKursiv:
                            Markierung.insertNode(kursiv);
                            $(Markierung.startContainer.nextSibling).html('&#65279;');
                        break;
                        case bokunoeditorToolbarFett:
                            Markierung.insertNode(fett);
                            $(Markierung.startContainer.nextSibling).html('&#65279;');
                        break;    
                    }
                        
                sel.removeAllRanges();
                sel.addRange(Markierung);
                
                }, 10);
            }
        });
        $('#bokunoeditorContent div').on('input',function(e){
            
        });
        $('#bokunoeditorContent').on('blur',function(){
            lastFocus=this;
        });
        
    };
    
}(jQuery));