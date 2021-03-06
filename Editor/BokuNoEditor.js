(function($){
    var scripts = document.getElementsByTagName("script"),
        Editor=null,
        src = scripts[scripts.length-1].src,
        absolutPath=src.slice(0,src.slice(0,src.lastIndexOf('/')).lastIndexOf('/')),
        lastFocus=null,img=null,Info=null,
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
        ],borderStyles='width:200px;border-top-style:solid;border-top-width:1px;border-left-style:solid;border-left-width:1px;border-bottom-style:solid;border-bottom-width:1px;border-right-style:solid;border-right-width:1px;';

    //$Info = Dokumentinformationen
    //$rtfFile = ist der Inhalt in der Box RTF oder HTML??
    //Menüleiste
    var BokuNoEditor = function($Option,$Value){
        switch($Option){
            case 'init':
                Editor=$(this);
                Info=$Value['info'];
                return BokuNoEditor.prototype.initiate($Value['rtfFile']);
                break;
            case 'speichern':
                var callback=$Value;
                return BokuNoEditor.prototype.speicherDokument(callback);
                break;
            case 'laden':
                var File=$Value;
                return BokuNoEditor.prototype.ladeDokument(File);
                break;
        }
    };

    function setDokumentzaehler(){//Zeige die Anzahl der Zeichen, Wörter die im Dokument vorhanden sind
        $('#bneAnzZeichen').text($('#bokunoeditorContent').text().length+' Zeichen,');
        $('#bneAnzWoerter').text($('#bokunoeditorContent')[0].innerText.split( /\s+/ ).filter(function(v){return v!==''}).length+' W\xF6rter');
    }

    function getHTML($file){
        var $rtfFile=$file;
        //wenn ein File mitgeht überprüfe ob die Endung RTF ist
        if(($rtfFile!='' && $rtfFile != null)&&$rtfFile.indexOf('.')>0&&$rtfFile.substring($rtfFile.lastIndexOf('.'))==='.rtf'){
            $.post(absolutPath+'/Converter/RTF2HTML-Converter.php',{
                'RTF':$rtfFile
            },function(data){
                return initContent(data);
            });
        //Ist es kein RTF gib den HTML Code zurück
        }else{

        }
    };
    function initContent($HTML){
        lastFocus=$('#bokunoeditorContent').attr('contentEditable','true').html($HTML).focus();
        setDokumentzaehler();
        return lastFocus;
    };
    //Menüfunktionen
    BokuNoEditor.prototype={
        //Menüs
        neuesDokument : function (){
            $('#bokunoeditorContent').empty().append('<div>&#65279;');
            $('#bneAnzZeichen').text('0 Zeichen,');
            $('#bneAnzWoerter').text('0 W\xF6rter');
        },
        speicherDokument:function(callback){
            $('b,i').removeAttr('style');
            return $.ajax({type: "POST", url: absolutPath+'/Converter/HTML2RTF-Converter.php',data:{
                Content:$('#bokunoeditorContent').html(),
                Info:JSON.stringify(Info),
                Format:$('#bokunoeditorContent').attr('class'),
                Seitenverhaeltnis:{'l':$('#bokunoeditorContent').css('border-left-width'),'r':$('#bokunoeditorContent').css('border-right-width'),'t':$('#bokunoeditorContent').css('border-top-width'),'b':$('#bokunoeditorContent').css('border-bottom-width')},
            }}).done(function(data){
                //data > Status:Ergebnis
                // Status = der Statuscodes des Ergebnisses
                //Ergebnis = der Dateiname
                callback($.parseJSON(data));
            });
        },

        ladeDokument:function(file){
            return getHTML(file);
        },
        returnDokument:function($Dokument){
            return $Dokument;
        },
        druckeDokument:function(){
            var w=window.open();
            w.document.write($('#bokunoeditorContent').html());
            w.print();
            w.close();
        },
        //Formatierung
        //Schrift
        Fett:function(){
            $('.bokunoeditorFett').toggleClass('bneActive');
            document.execCommand('bold',false,null);
            return;
        },
        Kursiv:function(){
            $('.bokunoeditorKursiv').toggleClass('bneActive');
            document.execCommand('italic',false,null);
            return;
        },
        Schriftart:function($Schrift){
            document.execCommand('fontName',false,$Schrift);
            return;
        },
        Schriftgroesse:function($Cursor,$Groesse){
            if($Cursor.startOffset != $Cursor.endOffset){
                ersetzeSelectedText(getSelectionText(),[{'formatierung':'font-size','value':$Groesse}]);
            }else{
                beginneNeueFormatierung([{'formatierung':'font-size','value':$Groesse}]);
            }
            return;
        },
        //Ausrichtung:
        Links:function(){
            $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
            $('.bokunoeditorToolbarLinks').addClass('bneActive');
            document.execCommand('justifyLeft',false,null);
            return;
        },
        Zentriert:function(){
            $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
            $('.bokunoeditorToolbarMitte').addClass('bneActive');
            document.execCommand('justifyCenter',false,null);
            return;
        },
        Rechts:function(){
            $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
            $('.bokunoeditorToolbarRechts').addClass('bneActive');
            document.execCommand('justifyRight',false,null);
            return;
        },
        Blocksatz:function(){
            $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
            $('.bokunoeditorToolbarBlock').addClass('bneActive');
            document.execCommand('justifyFull',false,null);
            return;
        },
        //Extras
        //Events für Tabellen
        Tabelle:function($Cursor){
            document.execCommand('insertHTML',false,(($Cursor.anchorNode.nodeName=='DIV')?'<table><tr style><td style="'+borderStyles+'">&#65279;</td><td style="'+borderStyles+'">&#65279;</td></tr></table><br>':'<div><table><tr style><td style="border:1px solid rgb(0,0,0);">&#65279;</td><td style="border:1px solid rgb(0,0,0);">&#65279;</td></tr></table><br>'));
            return;
        },
        addZelleRechts:function($Cursor){
            var td= $($Cursor.anchorNode).closest('td'),
                tr=$($Cursor.anchorNode).closest('tr'),
                indexTD=td.index(),
                color=(td[0].style['border-top-color']);
            $.each(tr.closest('table').find('tr'),function(index,trs){
                $(trs).children().eq(indexTD).after('<td style="'+borderStyles+'border-top-color'+color+';border-left-color'+color+';border-right-color'+color+';border-bottom-color'+color+';">&#65279;');
            });
            return;
        },
        addZelleLinks:function($Cursor){
            var td= $($Cursor.anchorNode).closest('td'),
                tr=$($Cursor.anchorNode).closest('tr'),
                indexTD=td.index(),
                color=(td[0].style['border-top-color']);
            $.each(tr.closest('table').find('tr'),function(index,trs){
                $(trs).children().eq(indexTD).before('<td style="'+borderStyles+'border-top-color'+color+';border-left-color'+color+';border-right-color'+color+';border-bottom-color'+color+';">&#65279;');
            });
            return;
        },
        addZelleUnten:function($Cursor){
            var tr=$($Cursor.anchorNode).closest('tr'),
                td=$($Cursor.anchorNode).closest('td'),
                color=(td[0].style['border-top-color']);
            $.each(tr.children('td'),function(){
               td+='<td style="'+borderStyles+'border-top-color'+color+';border-left-color'+color+';border-right-color'+color+';border-bottom-color'+color+';">&#65279;</td>';
            });
            tr.after('<tr>'+td+'</tr>');
            return;
        },
        addZelleOben:function($Cursor){
            var tr=$($Cursor.anchorNode).closest('tr'),
                td=$($Cursor.anchorNode).closest('td'),
                color=(td[0].style['border-top-color']);
            $.each(tr.children('td'),function(){
               td+='<td style="'+borderStyles+'border-top-color'+color+';border-left-color'+color+';border-right-color'+color+';border-bottom-color'+color+';">&#65279;</td>';
            });
            tr.before('<tr>'+td+'</tr>');
            return;
        },
        delZelleRechts:function($Cursor){
            var td= $($Cursor.anchorNode).closest('td'),
                tr=$($Cursor.anchorNode).closest('tr'),
                indexTD=td.index();
            $.each(tr.closest('table').find('tr'),function(index,trs){
                $(trs).children().eq(indexTD+1).remove();
            });
            return;
        },
        delZelleLinks:function($Cursor){
            var td= $($Cursor.anchorNode).closest('td'),
                tr=$($Cursor.anchorNode).closest('tr'),
                indexTD=td.index();
            $.each(tr.closest('table').find('tr'),function(index,trs){
                $(trs).children().eq(indexTD-1).remove();
            });
            return;
        },
        delZelleUnten:function($Cursor){
            var tr=$($Cursor.anchorNode).closest('tr');
            tr.next('tr').remove();
            return;
        },
        delZelleOben:function($Cursor){
            var tr=$($Cursor.anchorNode).closest('tr');
            tr.prev('tr').remove();
            return;
        },
        changeFarbeZelle:function($Cursor,$Farbe){
            $($Cursor.anchorNode).closest('td').css({
                'border-top-color':$Farbe,
                'border-bottom-color':$Farbe,
                'border-left-color':$Farbe,
                'border-right-color':$Farbe
            });
            return;
        },

        //Events für Bilder
        //File einlesen und im editor als Bild anfügen
        insertIMG :function(input) {
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
                };
              reader.readAsDataURL(input.files[0]);
            }
            return;
        },
        imgHoehe:function(hoehe){
            img.css('height',hoehe);
            return;
        },
        imgBreite:function(breite){
            img.css('width',breite);
            return;
        },
        //Erstellung des Texteditors
        initiate:function($rtfFile){
            var Menu= document.createDocumentFragment(),
                DateiButton=document.createElement('Button'),DateiText=document.createTextNode('Datei'),
                SchriftButton=document.createElement('Button'),SchriftText=document.createTextNode('Schrift'),
                FormatButton=document.createElement('Button'),FormatText=document.createTextNode('Format');
            //Datei Button
            DateiButton.id="bokunoeditorDatei";
            DateiButton.className+="bokunoeditorMenueButton";
            DateiButton.setAttribute('type','button');
            Menu.appendChild(DateiButton).appendChild(DateiText);
            //Schrift Button
            SchriftButton.id="bokunoeditorSchrift";
            SchriftButton.className+="bokunoeditorMenueButton";
            SchriftButton.setAttribute('type','button');
            Menu.appendChild(SchriftButton).appendChild(SchriftText);
            //Format Button
            FormatButton.id="bokunoeditorFormat";
            FormatButton.className+="bokunoeditorMenueButton";
            FormatButton.setAttribute('type','button');
            Menu.appendChild(FormatButton).appendChild(FormatText);
        //DateiKontextmenü
            var DateiContext= document.createDocumentFragment(),
                DateiContainerContextmenu=document.createElement('DIV'),
                ContainerNeu=document.createElement('DIV'),ButtonNeu=document.createElement('Button'),TextNeu=document.createTextNode('Neu'),
                ContainerAbsenden=document.createElement('DIV'),ButtonAbsenden=document.createElement('Button'),TextAbsenden=document.createTextNode('Speichern'),
                ContainerDrucken=document.createElement('DIV'),ButtonDrucken=document.createElement('Button'),TextDrucken=document.createTextNode('Drucken');
            DateiContainerContextmenu.id='bokunoeditorMenuDateiContextmenu';
            DateiContainerContextmenu.className+='bokunoeditorContextMenu';
            //Neu Button
            ContainerNeu.id='bokunoeditorMenuDateiContextmenuNeu';
            ContainerNeu.className+='bneMenueTrennlinie';
            ButtonNeu.setAttribute('type','button');
            ButtonNeu.className+='bneMenuButton';
            DateiContainerContextmenu.appendChild(ContainerNeu).appendChild(ButtonNeu).appendChild(TextNeu);
            //Absenden Button
            ContainerAbsenden.id='bokunoeditorMenuDateiContextmenuAbsenden';
            ButtonAbsenden.setAttribute('type','button');
            ButtonAbsenden.className+='bneMenuButton';
            DateiContainerContextmenu.appendChild(ContainerAbsenden).appendChild(ButtonAbsenden).appendChild(TextAbsenden);
            //Drucken Button
            ContainerDrucken.id='bokunoeditorMenuDateiContextmenuDrucken';
            ButtonDrucken.setAttribute('type','button');
            ButtonDrucken.className+='bneMenuButton';
            DateiContainerContextmenu.appendChild(ContainerDrucken).appendChild(ButtonDrucken).appendChild(TextDrucken);
            DateiContext.appendChild(DateiContainerContextmenu);
        //SchriftKontextmenü
            var SchriftContext= document.createDocumentFragment(),
                SchriftContainerContextmenu=document.createElement('DIV'),
                ContainerFett=document.createElement('DIV'),FettButton=document.createElement('button'),FettTag=document.createElement('b'),FettText=document.createTextNode('B'),FettTextToolbar=document.createTextNode('Fett'),FettTextSpanToolbar=document.createElement('span'),
                ContainerKursiv=document.createElement('DIV'),KursivButton=document.createElement('button'),KursivTag=document.createElement('em'),KursivText=document.createTextNode('I'),KursivTextToolbar=document.createTextNode('Kursiv'),KursivTextSpanToolbar=document.createElement('span'),
                ContainerSchriftart=document.createElement('DIV'),SelectSchriftart=document.createElement('select'),SpanSchriftart=document.createElement('span'),TextSchriftart=document.createTextNode('Art'),
                ContainerSchriftgroesse=document.createElement('DIV'),SelectSchriftgroesse=document.createElement('select'),SpanSchriftgroesse=document.createElement('span'),TextSchriftgroesse=document.createTextNode('Gr\xF6\xDFe');
            SchriftContainerContextmenu.id="bokunoeditorMenuSchriftContextmenu";
            SchriftContainerContextmenu.className+="bokunoeditorContextMenu";
            //Fett
            ContainerFett.className+="bokunoeditorToolbarButtonContainer";
            FettButton.className+="bokunoeditorKontextButton bokunoeditorFett";
            FettButton.setAttribute('type','button');
            FettButton.appendChild(FettTag).appendChild(FettText);
            FettTextSpanToolbar.appendChild(FettTextToolbar);
            ContainerFett.appendChild(FettTextSpanToolbar);
            ContainerFett.appendChild(FettButton);
            SchriftContainerContextmenu.appendChild(ContainerFett);
            //Kursiv
            ContainerKursiv.className+="bokunoeditorToolbarButtonContainer";
            KursivButton.className="bokunoeditorKontextButton bokunoeditorKursiv";
            KursivButton.setAttribute('type','button');
            KursivButton.appendChild(KursivTag).appendChild(KursivText);
            KursivTextSpanToolbar.appendChild(KursivTextToolbar);
            ContainerKursiv.appendChild(KursivTextSpanToolbar);
            ContainerKursiv.appendChild(KursivButton);
            SchriftContainerContextmenu.appendChild(ContainerKursiv);
            //Schriftart
            ContainerSchriftart.id="bokunoeditorMenuSchriftContextmenuArt";
            ContainerSchriftart.className="bokunoeditorToolbarSelectContainer";
            SelectSchriftart.id="bokunoeditorMenuSchriftart";
            SelectSchriftart.className+="bokunoeditorToolbarSelect bokunoeditorSchriftart";
            SpanSchriftart.appendChild(TextSchriftart);
            ContainerSchriftart.appendChild(SpanSchriftart);
            //Lade Schriftarten
            $.each(Schriftart,function(index,value){
                var SchriftArtOption=document.createElement('option');
                SchriftArtOption.setAttribute('value',value);
                SchriftArtOption.appendChild(document.createTextNode(value));
                SelectSchriftart.appendChild(SchriftArtOption);
            });
            ContainerSchriftart.appendChild(SelectSchriftart);
            SchriftContainerContextmenu.appendChild(ContainerSchriftart);
            //Schriftgröße
            ContainerSchriftgroesse.id="bokunoeditorMenuSchriftContextmenuGroesse";
            ContainerSchriftgroesse.className="bokunoeditorToolbarSelectContainer";
            SelectSchriftgroesse.id="bokunoeditorMenuSchriftgroesse";
            SelectSchriftgroesse.className+="bokunoeditorToolbarSelect bokunoeditorSchriftgroesse";
            SpanSchriftgroesse.appendChild(TextSchriftgroesse);
            ContainerSchriftgroesse.appendChild(SpanSchriftgroesse);
            //Lade Schriftgröße
            $.each(Schriftgroesse,function(index,value){
                var SchriftgroesseOption=document.createElement('option');
                SchriftgroesseOption.setAttribute('value',value);
                ((value=='11')?SchriftgroesseOption.setAttribute('selected','selected'):'');
                SchriftgroesseOption.appendChild(document.createTextNode(value+' pt'));
                SelectSchriftgroesse.appendChild(SchriftgroesseOption);
            });
            ContainerSchriftgroesse.appendChild(SelectSchriftgroesse);
            SchriftContainerContextmenu.appendChild(ContainerSchriftgroesse);
            SchriftContext.appendChild(SchriftContainerContextmenu);
        //FormatKontextmenü
            var FormatContext=document.createDocumentFragment(),
                FormatContainerContextmenu=document.createElement('DIV'),
                AusrichtungLinksContainer=document.createElement('DIV'),AusrichtungLinksTextKontext=document.createTextNode('Links'),AusrichtungLinksSpanKontext=document.createElement('span'),AusrichtungLinksButton=document.createElement('button'),AusrichtungLinksSymbol=document.createElement('img'),
                AusrichtungMitteContainer=document.createElement('DIV'),AusrichtungMitteTextKontext=document.createTextNode('Zentriert'),AusrichtungMitteSpanKontext=document.createElement('span'),AusrichtungMitteButton=document.createElement('button'),AusrichtungMitteSymbol=document.createElement('img'),
                AusrichtungRechtsContainer=document.createElement('DIV'),AusrichtungRechtsTextKontext=document.createTextNode('Rechts'),AusrichtungRechtsSpanKontext=document.createElement('span'),AusrichtungRechtsButton=document.createElement('button'),AusrichtungRechtsSymbol=document.createElement('img'),
                AusrichtungJustifyContainer=document.createElement('DIV'),AusrichtungJustifyTextKontext=document.createTextNode('Blocksatz'),AusrichtungJustifySpanKontext=document.createElement('span'),AusrichtungJustifyButton=document.createElement('button'),AusrichtungJustifySymbol=document.createElement('img');
            FormatContainerContextmenu.id='bokunoeditorMenuFormatContextmenu';
            FormatContainerContextmenu.className+='bokunoeditorContextMenu';
            //Linksbündig
            AusrichtungLinksContainer.className+="bokunoeditorToolbarButtonContainer";
            AusrichtungLinksButton.className="bokunoeditorToolbarLinks bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung bneActive";
            AusrichtungLinksSymbol.setAttribute('src',absolutPath+'/SVG/left-alignment.svg');
            AusrichtungLinksButton.setAttribute('type','button');
            AusrichtungLinksButton.appendChild(AusrichtungLinksSymbol);
            AusrichtungLinksSpanKontext.appendChild(AusrichtungLinksTextKontext);
            AusrichtungLinksContainer.appendChild(AusrichtungLinksSpanKontext);
            AusrichtungLinksContainer.appendChild(AusrichtungLinksButton);
            //Zentriert
            AusrichtungMitteContainer.className+="bokunoeditorToolbarButtonContainer";
            AusrichtungMitteButton.className="bokunoeditorToolbarMitte bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung";
            AusrichtungMitteSymbol.setAttribute('src',absolutPath+'/SVG/center-alignment.svg');
            AusrichtungMitteButton.setAttribute('type','button');
            AusrichtungMitteButton.appendChild(AusrichtungMitteSymbol);
            AusrichtungMitteSpanKontext.appendChild(AusrichtungMitteTextKontext);
            AusrichtungMitteContainer.appendChild(AusrichtungMitteSpanKontext);
            AusrichtungMitteContainer.appendChild(AusrichtungMitteButton);
            //Rechtsbündig
            AusrichtungRechtsContainer.className+="bokunoeditorToolbarButtonContainer";
            AusrichtungRechtsButton.className="bokunoeditorToolbarRechts bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung";
            AusrichtungRechtsSymbol.setAttribute('src',absolutPath+'/SVG/right-alignment.svg');
            AusrichtungRechtsButton.setAttribute('type','button');
            AusrichtungRechtsButton.appendChild(AusrichtungRechtsSymbol);
            AusrichtungRechtsSpanKontext.appendChild(AusrichtungRechtsTextKontext);
            AusrichtungRechtsContainer.appendChild(AusrichtungRechtsSpanKontext);
            AusrichtungRechtsContainer.appendChild(AusrichtungRechtsButton);
            //Blocksatz
            AusrichtungJustifyContainer.className+="bokunoeditorToolbarButtonContainer";
            AusrichtungJustifyButton.className="bokunoeditorToolbarBlock bokunoeditorToolbarButton bokunoeditorToolbarAusrichtung";
            AusrichtungJustifySymbol.setAttribute('src',absolutPath+'/SVG/justify.svg');
            AusrichtungJustifyButton.setAttribute('type','button');
            AusrichtungJustifyButton.appendChild(AusrichtungJustifySymbol);
            AusrichtungJustifySpanKontext.appendChild(AusrichtungJustifyTextKontext);
            AusrichtungJustifyContainer.appendChild(AusrichtungJustifySpanKontext);
            AusrichtungJustifyContainer.appendChild(AusrichtungJustifyButton);
            //Anhängen
            FormatContainerContextmenu.appendChild(AusrichtungLinksContainer);
            FormatContainerContextmenu.appendChild(AusrichtungMitteContainer);
            FormatContainerContextmenu.appendChild(AusrichtungRechtsContainer);
            FormatContainerContextmenu.appendChild(AusrichtungJustifyContainer);
            FormatContext.appendChild(FormatContainerContextmenu);
        //Toolbar
            var Toolbar = document.createDocumentFragment(),
                Schriftformatierungscontainer=document.createElement('DIV'),Schriftartcontainer=document.createElement('DIV'),Ausrichtungscontainer=document.createElement('DIV'),Objektcontainer=document.createElement('DIV'),
                TabelleButton=document.createElement('button'),TabelleSymbol=document.createElement('img'),
                ImageButton=document.createElement('button'),ImageSymbol=document.createElement('img');
            //Fett
            Schriftformatierungscontainer.appendChild(FettButton.cloneNode(true));
            //Kursiv
            Schriftformatierungscontainer.appendChild(KursivButton.cloneNode(true));
            //Schriftart
            Schriftartcontainer.appendChild(SelectSchriftart.cloneNode(true));
            //Schriftgröße
            Schriftartcontainer.appendChild(SelectSchriftgroesse.cloneNode(true));
            //Ausrichtung
            Ausrichtungscontainer.appendChild(AusrichtungLinksButton.cloneNode(true));
            Ausrichtungscontainer.appendChild(AusrichtungMitteButton.cloneNode(true));
            Ausrichtungscontainer.appendChild(AusrichtungRechtsButton.cloneNode(true));
            Ausrichtungscontainer.appendChild(AusrichtungJustifyButton.cloneNode(true));
            //Tabelle
            TabelleButton.id='bokunoeditorTabelle';
            TabelleButton.className+='bokunoeditorToolbarButton bokunoeditorToolbarTabelle';
            TabelleButton.setAttribute('type','button');
            TabelleSymbol.setAttribute('src',absolutPath+'/SVG/squares.svg');
            Objektcontainer.appendChild(TabelleButton).appendChild(TabelleSymbol);
            //Image
            ImageButton.id='bokunoeditorBild';
            ImageButton.className+='bokunoeditorToolbarButton bokunoeditorToolbarBild';
            ImageButton.setAttribute('type','button');
            ImageSymbol.setAttribute('src',absolutPath+'/SVG/art.svg');
            Objektcontainer.appendChild(ImageButton).appendChild(ImageSymbol);
            Toolbar.appendChild(Schriftformatierungscontainer);
            Toolbar.appendChild(Schriftartcontainer);
            Toolbar.appendChild(Ausrichtungscontainer);
            Toolbar.appendChild(Objektcontainer);
        //FußFormatierungszeile
            var Formatierungszeile=document.createDocumentFragment(),
                FormatierungszeilenContainer=document.createElement('DIV'),
                Dokumentinformationen=document.createElement('DIV'),AnzZeichen=document.createElement('span'),AnzWoerter=document.createElement('span'),
                Tabellenformatierung=document.createElement('DIV'),
                AddRowRButton=document.createElement('Button'),AddRowRIMG=document.createElement('img'),
                AddRowLButton=document.createElement('Button'),AddRowLIMG=document.createElement('img'),
                AddRowOButton=document.createElement('Button'),AddRowOIMG=document.createElement('img'),
                AddRowUButton=document.createElement('Button'),AddRowUIMG=document.createElement('img'),
                DelRowRButton=document.createElement('Button'),DelRowRIMG=document.createElement('img'),
                DelRowLButton=document.createElement('Button'),DelRowLIMG=document.createElement('img'),
                DelRowOButton=document.createElement('Button'),DelRowOIMG=document.createElement('img'),
                DelRowUButton=document.createElement('Button'),DelRowUIMG=document.createElement('img'),
                ColorPickerContainer=document.createElement('DIV'),ColorPickerAktuelleFarbeButton=document.createElement('Button'),ColorPickerAktuelleFarbeCanvas=document.createElement('Canvas'),ColorPickerFarbAuswahlButton=document.createElement('Button'),
                Bildbearbeitungscontainer=document.createElement('DIV'),BildDimensionsContainer=document.createElement('DIV'),BildDimensionBreiteContainer=document.createElement('DIV'),BildDimensionBreiteLabel=document.createElement('label'),BildDimensionBreiteInput=document.createElement('input'),BildDimensionBreiteAppendix=document.createElement('DIV'),BildDimensionFaktor=document.createElement('span'),BildDimensionHoeheContainer=document.createElement('DIV'),BildDimensionHoeheLabel=document.createElement('label'),BildDimensionHoeheInput=document.createElement('input'),BildDimensionHoeheAppendix=document.createElement('DIV');

            FormatierungszeilenContainer.id='bokunoeditorFormatZeileContainer';
            //DokumentenInformationen
            Dokumentinformationen.className+='bokunoeditorFormatZeile bokunoeditorDokInfos';
            AnzZeichen.id='bneAnzZeichen';
            AnzWoerter.id='bneAnzWoerter';
            Dokumentinformationen.appendChild(AnzZeichen).appendChild(document.createTextNode('0 Zeichen,'));
            Dokumentinformationen.appendChild(AnzWoerter).appendChild(document.createTextNode('0 W\xF6rter'));
            //Tabellenformatierung
            Tabellenformatierung.className+="bokunoeditorFormatZeile bokunoeditorTableFormats";
            //Add
            //Rechts
            AddRowRButton.id='bokunoeditorFormatZeileAddRowRechts';
            AddRowRButton.className+='bokunoeditorFormatZeileButton';
            AddRowRButton.setAttribute('type','button');
            AddRowRIMG.setAttribute('src',absolutPath+'/SVG/insert-column-right-100.svg');
            //Links
            AddRowLButton.id='bokunoeditorFormatZeileAddRowLinks';
            AddRowLButton.className+='bokunoeditorFormatZeileButton';
            AddRowLButton.setAttribute('type','button');
            AddRowLIMG.setAttribute('src',absolutPath+'/SVG/insert-column-left-100.svg');
            //Top
            AddRowOButton.id='bokunoeditorFormatZeileAddRowOben';
            AddRowOButton.className+='bokunoeditorFormatZeileButton';
            AddRowOButton.setAttribute('type','button');
            AddRowOIMG.setAttribute('src',absolutPath+'/SVG/insert-row-above-100.svg');
            //Bot
            AddRowUButton.id='bokunoeditorFormatZeileAddRowUnten';
            AddRowUButton.className+='bokunoeditorFormatZeileButton';
            AddRowUButton.setAttribute('type','button');
            AddRowUIMG.setAttribute('src',absolutPath+'/SVG/insert-row-100.svg');
            //Del
            //Rechts
            DelRowRButton.id='bokunoeditorFormatZeileDelRowRechts';
            DelRowRButton.className+='bokunoeditorFormatZeileButton';
            DelRowRButton.setAttribute('type','button');
            DelRowRIMG.setAttribute('src',absolutPath+'/SVG/delete-column-right-100.svg');
            //Links
            DelRowLButton.id='bokunoeditorFormatZeileDelRowLinks';
            DelRowLButton.className+='bokunoeditorFormatZeileButton';
            DelRowLButton.setAttribute('type','button');
            DelRowLIMG.setAttribute('src',absolutPath+'/SVG/delete-column-left-100.svg');
            //Top
            DelRowOButton.id='bokunoeditorFormatZeileDelRowOben';
            DelRowOButton.className+='bokunoeditorFormatZeileButton';
            DelRowOButton.setAttribute('type','button');
            DelRowOIMG.setAttribute('src',absolutPath+'/SVG/delete-row-above-100.svg');
            //Bot
            DelRowUButton.id='bokunoeditorFormatZeileDelRowUnten';
            DelRowUButton.className+='bokunoeditorFormatZeileButton';
            DelRowUButton.setAttribute('type','button');
            DelRowUIMG.setAttribute('src',absolutPath+'/SVG/delete-row-100.svg');
            //Anhängen
            Tabellenformatierung.appendChild(AddRowRButton).appendChild(AddRowRIMG);
            Tabellenformatierung.appendChild(AddRowLButton).appendChild(AddRowLIMG);
            Tabellenformatierung.appendChild(AddRowOButton).appendChild(AddRowOIMG);
            Tabellenformatierung.appendChild(AddRowUButton).appendChild(AddRowUIMG);
            Tabellenformatierung.appendChild(DelRowRButton).appendChild(DelRowRIMG);
            Tabellenformatierung.appendChild(DelRowLButton).appendChild(DelRowLIMG);
            Tabellenformatierung.appendChild(DelRowOButton).appendChild(DelRowOIMG);
            Tabellenformatierung.appendChild(DelRowUButton).appendChild(DelRowUIMG);
            //Colorpicker
            ColorPickerContainer.id="bokunoeditorFormatZeileBorderColor";
            ColorPickerContainer.className+="bokunoeditorFormatZeileInput";
            ColorPickerAktuelleFarbeButton.id="bokunoeditorFormatZeileBorderColorButton";
            ColorPickerAktuelleFarbeButton.className+="bokunoeditorFormatZeileButtonColor bokunoeditorAktuelleFarbe";
            ColorPickerAktuelleFarbeButton.setAttribute('type','button');
            ColorPickerAktuelleFarbeCanvas.id="bokunoeditorFormatZeileBorderColorCanvas";
            ColorPickerAktuelleFarbeCanvas.setAttribute("style",'background-color:rgb(0,0,0);');
            ColorPickerContainer.appendChild(ColorPickerAktuelleFarbeButton).appendChild(ColorPickerAktuelleFarbeCanvas);
            ColorPickerFarbAuswahlButton.id+="bokunoeditorColorBorder";
            ColorPickerFarbAuswahlButton.className+="bokunoeditorOpenColor";
            ColorPickerFarbAuswahlButton.setAttribute('type','button');
            Tabellenformatierung.appendChild(ColorPickerContainer).appendChild(ColorPickerFarbAuswahlButton);
            //Bildbearbeitung
            Bildbearbeitungscontainer.className+='bokunoeditorFormatZeile bokunoeditorIMGFormats';
            BildDimensionsContainer.className+='bokunoeditorFormatZeileInput';
            //Breite
            BildDimensionBreiteContainer.className+='bokunoeditorFormatZeilePreLabel';
            BildDimensionBreiteInput.className+="bokunoeditorFormatZeileBreite bokunoeditorFormatZeileInput";
            BildDimensionBreiteInput.id="bokunoeditorFormatZeileIMGBreite";
            BildDimensionBreiteInput.setAttribute('type','number');
            BildDimensionBreiteAppendix.className+='bokunoeditorFormatZeileAppLabel';
            BildDimensionBreiteContainer.appendChild(BildDimensionBreiteLabel).appendChild(document.createTextNode('B:'));
            BildDimensionBreiteAppendix.appendChild(document.createTextNode('px'));
            BildDimensionFaktor.appendChild(document.createTextNode(' x '));
            BildDimensionsContainer.appendChild(BildDimensionBreiteContainer);
            BildDimensionsContainer.appendChild(BildDimensionBreiteInput);
            BildDimensionsContainer.appendChild(BildDimensionBreiteAppendix);
            BildDimensionsContainer.appendChild(BildDimensionFaktor);
            //Höhe
            BildDimensionHoeheContainer.className+='bokunoeditorFormatZeilePreLabel';
            BildDimensionHoeheInput.className+="bokunoeditorFormatZeileHoehe bokunoeditorFormatZeileInput";
            BildDimensionHoeheInput.id="bokunoeditorFormatZeileIMGHoehe";
            BildDimensionHoeheInput.setAttribute('type','number');
            BildDimensionHoeheAppendix.className+='bokunoeditorFormatZeileAppLabel';
            BildDimensionHoeheContainer.appendChild(BildDimensionHoeheLabel).appendChild(document.createTextNode('H:'));
            BildDimensionHoeheAppendix.appendChild(document.createTextNode('px'));
            BildDimensionsContainer.appendChild(BildDimensionHoeheContainer);
            BildDimensionsContainer.appendChild(BildDimensionHoeheInput);
            BildDimensionsContainer.appendChild(BildDimensionHoeheAppendix);
            Bildbearbeitungscontainer.appendChild(BildDimensionsContainer);
            //Ahängen an den Container
            FormatierungszeilenContainer.appendChild(Dokumentinformationen);
            FormatierungszeilenContainer.appendChild(Tabellenformatierung);
            FormatierungszeilenContainer.appendChild(Bildbearbeitungscontainer);
            Formatierungszeile.appendChild(FormatierungszeilenContainer);
        //Hidden Inputboxen
            var HiddenInputs=document.createDocumentFragment(),
                HiddenInputContainter=document.createElement('DIV'),
                FileUpload=document.createElement('input'),
                ColorPicker=document.createElement('input');
            HiddenInputContainter.id='bneHiddenInputs';
            //Fileupload
            FileUpload.id='bokunoeditorFileUpload';
            FileUpload.setAttribute('type','file');
            HiddenInputContainter.appendChild(FileUpload);
            //Colorpicker
            ColorPicker.id='bokunoeditorColorPicker';
            ColorPicker.className+='bokunoeditorColorPicker';
            ColorPicker.setAttribute('type','color');
            HiddenInputContainter.appendChild(ColorPicker);

            HiddenInputs.appendChild(HiddenInputContainter);
            var Textarea=Editor;
            //Vorbereitung des Editors
            $(Textarea).hide().parent().append('<div id="bokunoeditorIframe"><div id="bokunoeditorMenue"></div><div id="bokunoeditorToolbar"></div><div id="bokunoeditorContainer"><div id="bokunoeditorContent" class="A4"></div></div></div>');
            $('#bokunoeditorIframe').append(DateiContext).append(SchriftContext).append(FormatContext).append(Formatierungszeile).append(HiddenInputs);
            $('#bokunoeditorMenue').html(Menu);//Menüzeile
            $('#bokunoeditorToolbar').html(Toolbar);//Toolbar
            //Vorbefüllung des Editors
            this.ladeDokument($rtfFile);
            //wenn nichts eingefügt wurde dann gib DIV vor
            (($('#bokunoeditorContent div').length===0)?$('#bokunoeditorContent').append('<div><br></div>'):'');
            this.texteditorEvents();
            return this;
        },
        texteditorEvents:function(){
            //***~~~EVENTS~~~***
            //Datei > Neu -> leere den Editor
            $('#bokunoeditorMenuDateiContextmenuNeu button').click(this.neuesDokument);
            //Datei > Absenden -> Speichere als RTF File
            $('#bokunoeditorMenuDateiContextmenuAbsenden button').click(this.speicherDokument);
            //Kontextmenü -> nur eines zum selben Moment offen
            $('.bokunoeditorMenueButton').click(function(){
                var menu=$(this);
                switch(menu[0].id){
                    case 'bokunoeditorDatei':
                        $('#bokunoeditorMenuDateiContextmenu').toggleClass('bneOpen').siblings().removeClass('bneOpen');
                        break;
                    case 'bokunoeditorSchrift':
                        $('#bokunoeditorMenuSchriftContextmenu').toggleClass('bneOpen').siblings().removeClass('bneOpen');
                        break;
                    case 'bokunoeditorFormat':
                        $('#bokunoeditorMenuFormatContextmenu').toggleClass('bneOpen').siblings().removeClass('bneOpen');
                        break;

                }
            });
            //Drucken
            $('#bokunoeditorMenuDateiContextmenuDrucken').click(this.druckeDokument);
            //Bilder einfügen in den Editor
            $('#bokunoeditorFileUpload').change(function(){BokuNoEditor.prototype.insertIMG(this);});
            //Formatierung bei Knöpfen
            //Fett
            $('.bokunoeditorFett,bokunoeditorKontextButtonContainerFett').click(this.Fett);
            //Kursiv
            $('.bokunoeditorKursiv,bokunoeditorKontextButtonContainerKursiv').click(this.Kursiv);
            //Ausrichtung
            //Links
            $('.bokunoeditorToolbarLinks').click(this.Links);
            //Mitte
            $('.bokunoeditorToolbarMitte').click(this.Zentriert);
            //Rechts
            $('.bokunoeditorToolbarRechts').click(this.Rechts);
            //Block
            $('.bokunoeditorToolbarBlock').click(this.Blocksatz);
            $('.bokunoeditorToolbarButton').click(function(){
                var Button=$(this);
                if(lastFocus){
                    setTimeout(function() {
                        var sel = window.getSelection();
                        lastFocus.focus();
                        switch(Button[0].id){
                            case 'bokunoeditorTabelle':
                                BokuNoEditor.prototype.Tabelle(sel);
                                 break;
                            case 'bokunoeditorBild':
                                $('#bokunoeditorFileUpload').click();
                                break;
                        }
                    }, 10);
                }
            });
            //Formatierung bei Select Feldern
            $('.bokunoeditorToolbarSelect').change(function(){
                var Select=$(this);
                if(lastFocus){
                    setTimeout(function() {
                        lastFocus.focus();
                        var sel = window.getSelection(),
                            Markierung=sel.getRangeAt(0).cloneRange();
                        switch (Select[0].id) {
                            case 'bokunoeditorMenuSchriftgroesse':
                            case 'bokunoeditorToolbarSchriftgroesse':
                                BokuNoEditor.prototype.Schriftgroesse(Markierung,Select.val());
                            break;
                            case 'bokunoeditorMenuSchriftart':
                            case 'bokunoeditorToolbarSchriftart':
                               BokuNoEditor.prototype.Schriftart(Select.val());
                            break;
                        }
                        $('.bokunoeditorContextMenu').removeClass('bneOpen');
                    }, 10);
                }
            });
            //Formatierung für die Extramodule(Tabelle)
            $('.bokunoeditorFormatZeileButton').click(function(){
                var Button=$(this);
                if(lastFocus){
                    setTimeout(function() {
                        var sel = window.getSelection();
                        lastFocus.focus();
                        switch(Button[0].id){
                            case 'bokunoeditorFormatZeileAddRowRechts':
                                BokuNoEditor.prototype.addZelleRechts(sel);
                                break;
                            case 'bokunoeditorFormatZeileAddRowLinks':
                                BokuNoEditor.prototype.addZelleLinks(sel);
                                break;
                            case 'bokunoeditorFormatZeileAddRowUnten':
                                BokuNoEditor.prototype.addZelleUnten(sel);
                                break;
                            case 'bokunoeditorFormatZeileAddRowOben':
                                BokuNoEditor.prototype.addZelleOben(sel);
                                break;
                            case 'bokunoeditorFormatZeileDelRowRechts':
                                BokuNoEditor.prototype.delZelleRechts(sel);
                                break;
                            case 'bokunoeditorFormatZeileDelRowLinks':
                                BokuNoEditor.prototype.delZelleLinks(sel);
                                break;
                            case 'bokunoeditorFormatZeileDelRowUnten':
                                BokuNoEditor.prototype.delZelleUnten(sel);
                                break;
                            case 'bokunoeditorFormatZeileDelRowOben':
                                BokuNoEditor.prototype.delZelleOben(sel);
                                break;
                        }
                    },10);
                }
            });
            //Colorpicker
            $('.bokunoeditorAktuelleFarbe').click(function(){
                var Button=$(this),
                    Farbe =Button.find('canvas').css('background-color');
                if(lastFocus){
                    setTimeout(function() {
                        var sel = window.getSelection();
                        lastFocus.focus();
                        switch(Button[0].id){
                            case 'bokunoeditorFormatZeileBorderColorButton'://Rahmenfarbe
                                BokuNoEditor.prototype.changeFarbeZelle(sel,Farbe);
                                break;
                        }
                    },10);
                }
            });
            $('.bokunoeditorOpenColor').click(function(){
                var Button=$(this);
                if(lastFocus){
                    setTimeout(function() {
                        var sel = window.getSelection();
                        lastFocus.focus();
                        switch(Button[0].id){
                            case 'bokunoeditorColorBorder'://Rahmenfarbe
                                $('#bokunoeditorColorPicker').click();
                                $('#bokunoeditorColorPicker').one('change',function(){
                                    var RGB=$('#bokunoeditorColorPicker').val().match(/[A-Za-z0-9]{2}/g).map(function(v) { return parseInt(v, 16)}).join(","),
                                        Farbe="rgb("+RGB+")";
                                    $('#bokunoeditorFormatZeileBorderColorCanvas').css('background-color',Farbe);
                                    BokuNoEditor.prototype.changeFarbeZelle(sel,Farbe);
                                });
                                break;
                        }
                    },10);
                }
            });
            //SizeChanger von Images
            $('.bokunoeditorFormatZeileInput').on('input',function(){
                var input=$(this);
                switch (input[0].id) {
                    case 'bokunoeditorFormatZeileIMGHoehe':
                        BokuNoEditor.prototype.imgHoehe(input.val());
                        break;
                    case 'bokunoeditorFormatZeileIMGBreite':
                        BokuNoEditor.prototype.imgBreite(input.val());
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
                    $('#bokunoeditorFormatZeileIMGBreite').val(parseInt($(e.target).css('width')));
                    $('#bokunoeditorFormatZeileIMGHoehe').val(parseInt($(e.target).css('height')));
                }else{
                    if(img!==null)img.removeClass('bneFocus');
                    $('.bokunoeditorIMGFormats').css('display','none');
                }
                (($(e.target).closest('td').length>0)?$('.bokunoeditorTableFormats').css('display','inline-block'):$('.bokunoeditorTableFormats').css('display','none'));
                if($(e.target).closest('div').css('text-align')=='left'||$(e.target).closest('div').css('text-align')=='start'||$(e.target).closest('td').css('text-align')=='left'||$(e.target).closest('td').css('text-align')=='start'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('.bokunoeditorToolbarLinks').addClass('bneActive');
                }
                if($(e.target).closest('div').css('text-align')=='center'||$(e.target).closest('td').css('text-align')=='center'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('.bokunoeditorToolbarMitte').addClass('bneActive');
                }
                if($(e.target).closest('div').css('text-align')=='right'||$(e.target).closest('td').css('text-align')=='right'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('.bokunoeditorToolbarRechts').addClass('bneActive');
                }
                if($(e.target).closest('div').css('text-align')=='justify'||$(e.target).closest('td').css('text-align')=='justify'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('.bokunoeditorToolbarBlock').addClass('bneActive');
                }
                if($(e.target).css('font-style')=='italic')$('.bokunoeditorKursiv').addClass('bneActive');
                if($(e.target).css('font-style')=='normal')$('.bokunoeditorKursiv').removeClass('bneActive');
                if($(e.target).css('font-weight')=='700')$('.bokunoeditorFett').addClass('bneActive');
                if($(e.target).css('font-weight')=='400')$('.bokunoeditorFett').removeClass('bneActive');
                $('.bokunoeditorSchriftart option[value="'+$(e.target).css('font-family').replace(/\"/g,'')+'"]').prop('selected',true);
                $('.bokunoeditorSchriftgroesse option[value="'+Math.round(parseFloat($(e.target).css('font-size'))*72/96,1)+']').prop('selected',true);

            },'mousedown':function(e){
                $('.bokunoeditorContextMenu').removeClass('bneOpen');
                if(e.target.nodeName=='IMG'){
                    img=$(e.target);
                    img.addClass('bneFocus');
                    $('.bokunoeditorIMGFormats').css('display','inline-block');
                    $('#bokunoeditorFormatZeileIMGBreite').val(parseInt(img.css('width')));
                    $('#bokunoeditorFormatZeileIMGHoehe').val(parseInt(img.css('height')));
                }else{
                    if(img!==null)img.removeClass('bneFocus');
                    $('.bokunoeditorIMGFormats').css('display','none')
                }
                (($(e.target).closest('td').length>0)?$('.bokunoeditorTableFormats').css('display','inline-block'):$('.bokunoeditorTableFormats').css('display','none'));
                if($(e.target).closest('div').css('text-align')=='left'||$(e.target).closest('div').css('text-align')=='start'||$(e.target).closest('td').css('text-align')=='left'||$(e.target).closest('td').css('text-align')=='start'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('.bokunoeditorToolbarLinks').addClass('bneActive');
                }
                if($(e.target).closest('div').css('text-align')=='center'||$(e.target).closest('td').css('text-align')=='center'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('.bokunoeditorToolbarMitte').addClass('bneActive');
                }
                if($(e.target).closest('div').css('text-align')=='right'||$(e.target).closest('td').css('text-align')=='right'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('.bokunoeditorToolbarRechts').addClass('bneActive');
                }
                if($(e.target).closest('div').css('text-align')=='justify'||$(e.target).closest('td').css('text-align')=='justify'){
                    $('.bokunoeditorToolbarAusrichtung').removeClass('bneActive');
                    $('.bokunoeditorToolbarBlock').addClass('bneActive');
                }
                if($(e.target).css('font-style')=='italic')$('.bokunoeditorKursiv').addClass('bneActive');
                if($(e.target).css('font-style')=='normal')$('.bokunoeditorKursiv').removeClass('bneActive');
                if($(e.target).css('font-weight')=='700')$('.bokunoeditorFett').addClass('bneActive');
                if($(e.target).css('font-weight')=='400')$('.bokunoeditorFett').removeClass('bneActive');
                $('.bokunoeditorSchriftart option[value="'+$(e.target).css('font-family').replace(/\"/g,'')+'"]').prop('selected',true);
                $('.bokunoeditorSchriftgroesse option[value="'+Math.round(parseFloat($(e.target).css('font-size'))*72/96,1)+'"]').prop('selected',true);
            },'blur':function(){//Fokus zurück zum Editor
                lastFocus=this;
            },'keydown':function(e){
                if (e.keyCode === 13) {
                    e.preventDefault;
                    document.execCommand("defaultParagraphSeparator", false, "div");
                }
            },'keyup':setDokumentzaehler
        });
        return this;
        }

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
        var sel, range,oldContent,startContent,endContent;
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
                }
                //Single Line Formatierung
                else{
                    format.append(oldContent.text());
                    range.insertNode(format);
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
    //Filter
    function filterArrayCR(text){
        return text !='\n\n';
    }

    $.fn.bokunoeditor=BokuNoEditor;
//Initialisiere BokuNoEditor
}(jQuery));
