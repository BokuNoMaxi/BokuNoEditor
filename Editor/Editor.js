$.fn.bokunoeditor=function(){
    var Textarea=$(this);
    $(Textarea).hide().parent().append('<div id="bokunoeditorIframe"><div id="bokunoeditorMenue"></div><div id="bokunoeditorToolbar"></div><div id="bokunoeditorContent"></div></div>');
    $('#bokunoeditorContent').attr('contentEditable','true');
    $('#bokunoeditorMenue').html('<button class="bokunoeditorMenueButton">Datei</button><button class="bokunoeditorMenueButton">Schriftart</button><button class="bokunoeditorMenueButton">Format</button>');
};