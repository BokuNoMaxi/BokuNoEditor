(function($){
    var Schriftart=[
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
    
    $.fn.bokunoeditor=function(){
        var Textarea=$(this);
        $(Textarea).hide().parent().append('<div id="bokunoeditorIframe"><div id="bokunoeditorMenue"></div><div id="bokunoeditorToolbar"></div><div id="bokunoeditorContent"></div></div>');
        $('#bokunoeditorContent').attr('contentEditable','true').html($(Textarea).val());
        $('#bokunoeditorMenue').html('  <button class="bokunoeditorMenueButton">Datei</button><button class="bokunoeditorMenueButton">Schriftart</button><button class="bokunoeditorMenueButton">Format</button>');
        
        $('#bokunoeditorToolbar').html('    <button class="bokunoeditorToolbarButton">B</button><button class="bokunoeditorToolbarButton">I</button><select class="bokunoeditorToolbarSelect" id="bokunoeditorSchriftart"></select><select class="bokunoeditorToolbarSelect" id="bokunoeditorSchriftgroesse"></select>');
        $.each(Schriftart,function(index,value){
            $('#bokunoeditorSchriftart').append('<option value="'+value+'">'+value+'</option>');
        });
        $.each(Schriftgroesse,function(index,value){
            $('#bokunoeditorSchriftgroesse').append('<option value="'+value+'">'+value+' pt</option>');
        });
    };
    
}(jQuery));