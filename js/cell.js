// ******************************
// CELL
// ******************************
// Depends on raphael.js
// Depends on jquery.js
/**
>> TODO : nom du projet
> SyntheSix
*/
"use strict";
(function (glob, factory) {
    factory(glob);
}(this,
function (window) {
    
            
        /*\
         * FRMWRK : PROPERTIES
        \*/
        
        // INIT : Holder des properties
        var properties = {};
        properties.side = 50;
        properties.apothem = computeApothem(properties.side);
        properties.defaultColor = '#000066'
        
        function computeApothem( side ){
            var apothem = Math.sqrt(3) / 2 * side; 
            return apothem;
        };
        
        function Properties(properties){
            for(var propertyName in properties){
                this[propertyName] = properties[propertyName]
            }
        }
        Properties.prototype.get = function( propertyName ) {
            return this[propertyName];
        };
        Properties.prototype.add = function( propertyName, propertyValue ) {
            this[propertyName] = propertyValue;
        };
        
        /*\
         * FRMWRK : POINTS ET VECTORS
        \*/
        function Point( x, y ) {
            this.x = x;
            this.y = y;
        }
        Point.browserX = properties.side;
        Point.browserY = properties.apothem;
        Point.vectors = {};
        // Définition des vecteurs natifs X, Y, U, V et W.
        Point.vectors.X= new Vector( 1, 0, 2/3, 2/3, 0 );
        Point.vectors.Y= new Vector( 0, 1, -1, 1, 1/2 );
        Point.vectors.U= new Vector( 1.5, -1, 1, 0, 0 );
        Point.vectors.V= new Vector( 1.5, 1, 0, 1, 0 );
        Point.vectors.W= new Vector( 0, -2, 0, 0, 1 );
        //    ___
        //   /   \ V
        //   \___/ U
        //     W

        Point.X = function (point, n) {return Point.vectors.X.translate(point, n);};
        Point.Y = function (point, n) {return Point.vectors.Y.translate(point, n);};
        Point.U = function (point, n) {return Point.vectors.U.translate(point, n);};
        Point.V = function (point, n) {return Point.vectors.V.translate(point, n);};
        Point.W = function (point, n) {return Point.vectors.W.translate(point, n);};

        /**
         * Renvoie les coordonnées du point, dans une unité compatible avec le navigateur.
         */
        Point.prototype.toBrowserXY = function(){
            var _x = this.x * Point.browserX;
            var _y = this.y * Point.browserY;
            return {x:_x, y:_y};
        }

        Point.fromBrowserXY = function(x, y){
            var _x = Math.floor( 2 * x / Point.browserX) / 2;
            var _y = Math.floor( 2 * y / Point.browserY) / 2;
            return new Point(_x, _y);
        }
        
        /**
         * Vecteur
         */ 
        function Vector( x, y, u, v, w ) {
            this.x = x;
            this.y = y;
        }
        
        /**
         * Renvoie le points translaté de n, selon le vecteur utilisé.
         */
        Vector.prototype.translate = function( point , n ){
            if(typeof n !== 'undefined'){    
                var targetX = point.x + this.x * n;
                var targetY = point.y + this.y * n;
                return new Point(targetX, targetY);
            }
            return this.translate(point , 1);
        };
        
        
        
        /****************************************\
         * 
         * HEXA CELL GRID
         *
        \****************************************/
        function HexaCellGrid( properties ) {
            this.properties =  new Properties(properties);
            this.renderer = new HexaCellGridRenderer(this);
            this.cells =[];
        }
        var HCG = new HexaCellGrid(properties);
        
        
        /**\
         * Refresh
         **
         * Affiche le contenu de l'écran
        \**/
        HexaCellGrid.prototype.init = function() {
            this.renderer.render();
            
            var grid = this;
            this.renderer.ondblClick(new CellControler(function(evt, renderer){
               grid.showCellAt( Point.fromBrowserXY( evt.clientX, evt.clientY ) );
            }) );
            this.showCellAt( 10, 12 );
        };
        
        HexaCellGrid.prototype.getProperty = function( propertyName ) {
            return this.properties.get(propertyName);
        };
        
        /**\
         * Charge un fichier JSON permettant d'initialiser HexaCellGrid.
        \**/
        HexaCellGrid.prototype.load = function (data) {
            this.data = JSON.parse(data);
        };

        /**\
         * Sauvegarde des données, sous forme de JSON.
        \**/
        HexaCellGrid.prototype.save = function() {
            alert('Data Saved!');
            var savedData = window.open();
            savedData.document.write(JSON.stringify(this.cells));
        };

        /**\
         * Refresh
         **
         * Affiche le contenu de l'écran
        \**/
        HexaCellGrid.prototype.refresh = function() {
            this.renderer.refresh();
        }
            
        // GESTION INTERNE DES CELLULES

        /**\
         * GetCell
        \**/
        HexaCellGrid.prototype.getCell = function( x, y ){
            if(typeof y !== 'undefined'){
                var cell_y = this.cells[x]
                if(cell_y){
                    return this.cells[x][y];
                }
                return null;
            }
            var point = x;
            return this.getCell(point.x, point.y);
        };

        /**\
         * AddCell
        \**/
        HexaCellGrid.prototype.addCell = function( cell ){
            var cell_y = this.cells[cell.origin.x];
            if(!cell_y){
                cell_y = [];
                this.cells[cell.origin.x] = cell_y;
            }
            this.cells[cell.origin.x][cell.origin.y] = cell;
        }

        /**\
         * Show Cell
        \**/
        HexaCellGrid.prototype.showCellAt = function( x, y ){
            if(typeof y !== 'undefined'){
                var cell = this.getCell(x, y);
                if(!cell){
                    cell = new Cell(this, x, y);
                    this.addCell(cell);
                } 
                cell.show();
                return;
            } 
            var point = x;
            this.showCellAt(point.x, point.y);
        };

        /**\
         * HideCell
        \**/
        HexaCellGrid.prototype.hideCellAt = function( renderer, x, y ){
            if(typeof y !== 'undefined'){
                var cell = this.getCell( x, y );
                if(cell){
                    cell.hide( renderer );
                }
                return;
            }
            var point = x;
            this.hideCellAt(renderer, point.x, point.y);
        };

        /**\
         * DropCell
        \**/
        HexaCellGrid.prototype.dropCellAt = function( renderer, x, y ){
            if(typeof y !== 'undefined'){
                var cell = this.getCell( x, y );
                if(cell){
                    this.cells[x][y] = null;
                    cell.drop(renderer);
                }
                return;
            }
            var point = x;
            this.dropCellAt(renderer, point.x, point.y);
        };
        
        /****************************************\
         *
         * HEXA CELL GRID CONTROLLER
         * 
        \****************************************/
        function HexaCellGridController ( hxgrid ){
            
        }
        
        /****************************************\
         *
         * HEXA CELL GRID RENDERER
         * 
        \****************************************/
        function HexaCellGridRenderer ( hexaGrid ){
            this.hexaGrid = hexaGrid;
            
            this.observers = {};
            this.observers.click = [];
            this.observers.dblClick = [];
            this.observers.hoverIn = [];
            this.observers.hoverOut = [];
        }
        
        /**
         * Action "click" sur l'objet représentant la grille de cellules.
         */
        HexaCellGridRenderer.prototype.click = function( evt ){
            var clickObservers = this.observers.click.slice();
            for (var observerName in clickObservers) {
                var observer = clickObservers[observerName];
                observer.notify(evt, this);
            }
            this.refresh();
        };    

        HexaCellGridRenderer.prototype.onclick = function( observer ){
            this.observers.click.push(observer);
        };
        
        HexaCellGridRenderer.prototype.unclick = function( observer ){
            this.observers.click = utils.removeFromArray ( this.observers.click , observer);
        };
        
        /**
         * Action "dblClick" sur l'objet représentant la grille de cellules.
         */
        HexaCellGridRenderer.prototype.dblClick = function( evt ){
            var dblClickObservers = this.observers.dblClick.slice();
            for (var observerName in dblClickObservers) {
                var observer = dblClickObservers[observerName];
                observer.notify(evt, this);
            }
            this.refresh();
        };

        HexaCellGridRenderer.prototype.ondblClick = function( observer ){
            this.observers.dblClick.push(observer);
        };
        
        HexaCellGridRenderer.prototype.undblClick = function( observer ){
            this.observers.dblClick = utils.removeFromArray ( this.observers.dblClick , observer);
        };        
        
        /**
         * Action "hoverIn" sur l'objet représentant la grille de cellules.
         */
        HexaCellGridRenderer.prototype.hoverIn = function(evt){
            var hoverInObservers = this.observers.hoverIn.slice();
            for (var observerName in hoverInObservers) {
                var observer = hoverInObservers[observerName];
                observer.notify(evt, this);
            }
            this.refresh();
        };
        
        HexaCellGridRenderer.prototype.onHoverIn = function( observer ){
            this.observers.hoverIn.push(observer);
        };
        
        HexaCellGridRenderer.prototype.unHoverIn = function( observer ){
            this.observers.hoverIn = utils.removeFromArray( this.observers.hoverIn , observer);
        };
        
        /**
         * Action "hoverOut" sur l'objet représentant la grille de cellules.
         */
        HexaCellGridRenderer.prototype.hoverOut = function(evt){
            var hoverOutObservers = this.observers.hoverOut.slice();
            for (var observerName in hoverOutObservers) {
                var observer = hoverOutObservers[observerName];
                observer.notify(evt, this);
            }
            this.refresh();
        };    
        
        HexaCellGridRenderer.prototype.onHoverOut = function( observer ){
            this.observers.hoverOut.push(observer);
        };
        
        HexaCellGridRenderer.prototype.unHoverOut = function( observer ){
            this.observers.hoverOut = utils.removeFromArray ( this.observers.hoverOut , observer);
        };
        
        HexaCellGridRenderer.prototype.render = function() {
            if(typeof this.renderer !== 'undefined'){
                return;
            }
            var hexaGridRenderer = this; // Définition d'une variable locale, qui sera valable pour le scope de toutes les fonction internes ci-dessous.
            var hexaGrid = this.hexaGrid; // Définition d'une variable locale, qui sera valable pour le scope de toutes les fonction internes ci-dessous.
            this.renderer = Raphael('content', $('#content').width(), $('#content').height());
            this.renderer.raphael
                .click(clickGrid)
                .dblclick(dblClickGrid);
                
            /* Définition du "click" sur la grille d'hexagones cellule, en s'appuyant sur le CellRenderer. */
            function clickGrid(evt) {
                hexaGridRenderer.click(evt);
            }
            /* Définition du "double-click" sur une cellule, en s'appuyant sur le CellRenderer. */
            function dblClickGrid(evt) {
                hexaGridRenderer.dblClick(evt);
            }
        }
        
        /**\
         * Refresh
         **
         * Affiche le contenu de l'écran
        \**/
        HexaCellGridRenderer.prototype.refresh = function() {
            this.renderer.setSize( $('#content').width(), $('#content').height() );
        }
            
        /****************************************\
         *
         * CELL
         * 
        \****************************************/
        function Cell( hexaGrid, x , y ) {
            this.hexaGrid = hexaGrid;
            this.data = {};
            this.origin = new Point(x, y);
            this.color = hexaGrid.getProperty('defaultColor');
            this.state = {
                color:hexaGrid.getProperty('defaultColor'),
                opacity:0.1
            }
            this.renderer = new CellRenderer(this);
        }

        /**
         * Renvoie l'élément représentant la cellule dans le navigateur.
         */
        Cell.prototype.findCellRenderer = function( renderer ){
            var point = this.origin.toBrowserXY();
            var cellRenderer = renderer.getElementByPoint(point.x, point.y);
            return cellRenderer;
        };    
        
        // TODO
        // TODO
        // TODO
        // TODO
        Cell.prototype.show = function(){
            this.renderer.render();
        };
        
        /****************************************
         *
         * CELL CONTROLLER
         * 
         ****************************************/
        function CellControler ( controller ){
            this.controller = controller;
        }
        
        CellControler.prototype.notify = function(evt, cellRenderer ){
             return this.controller.call(this, evt, cellRenderer);
        }
        
        CellControler.UNSELECT = new CellControler(function unselect( evt, cellRenderer ) {
            if(CellControler.SELECT.selected !=null && CellControler.SELECT.selected == cellRenderer){
                CellControler.SELECT.selected = null;
            }
            cellRenderer.cell.state.opacity = 0.2;
            
            cellRenderer.onHoverIn(CellControler.HOVER_IN);
            cellRenderer.onHoverOut(CellControler.HOVER_OUT);
            
            cellRenderer.unclick(CellControler.UNSELECT);
            cellRenderer.onclick(CellControler.SELECT);
        } );

        CellControler.SELECT = new CellControler( function select( evt, cellRenderer ) {
            if( this.selected != null ){
                CellControler.UNSELECT.notify(this.selected);
            }
            this.selected = cellRenderer
            
            cellRenderer.cell.state.opacity = 1;
            
            cellRenderer.unHoverIn(CellControler.HOVER_IN);
            cellRenderer.unHoverOut(CellControler.HOVER_OUT);
            
            cellRenderer.unclick(CellControler.SELECT);
            cellRenderer.onclick(CellControler.UNSELECT);
        } );

        CellControler.HOVER_IN = new CellControler(function hoverin( evt, cellRenderer ) {
            cellRenderer.cell.state.opacity = cellRenderer.cell.state.opacity * 2;
        } );

        CellControler.HOVER_OUT = new CellControler( function hoverout( evt, cellRenderer ) {
            cellRenderer.cell.state.opacity = cellRenderer.cell.state.opacity / 2;
        } );
        
        /****************************************
         *
         * CELL RENDERER
         * TODO : Fucking Observable
         ****************************************/
        function CellRenderer( cell ){
            this.cell = cell;
            
            this.observers = {};
            this.observers.click = [];
            this.observers.dblClick = [];
            this.observers.hoverIn = [];
            this.observers.hoverOut = [];
            
            this.render();
            this.onclick(CellControler.SELECT);
            this.onHoverIn(CellControler.HOVER_IN);
            this.onHoverOut(CellControler.HOVER_OUT);
            
        }
        
        /**
         * Action "click" sur l'objet représentant une cellule.
         */
        CellRenderer.prototype.click = function(evt){
            var clickObservers = this.observers.click.slice();
            for (var observerName in clickObservers) {
                var observer = clickObservers[observerName];
                observer.notify(evt, this);
            }
            this.refresh();
        };    

        CellRenderer.prototype.onclick = function( observer ){
            this.observers.click.push(observer);
        };
        
        CellRenderer.prototype.unclick = function( observer ){
            this.observers.click = utils.removeFromArray ( this.observers.click , observer);
        };
        
        /**
         * Action "dblClick" sur l'objet représentant une cellule.
         */
        CellRenderer.prototype.dblClick = function(evt){
            var dblClickObservers = this.observers.dblClick.slice();
            for (var observerName in dblClickObservers) {
                var observer = dblClickObservers[observerName];
                observer.notify(evt, this);
            }
            this.refresh();
        };

        CellRenderer.prototype.ondblClick = function( observer ){
            this.observers.dblClick.push(observer);
        };
        
        CellRenderer.prototype.undblClick = function( observer ){
            this.observers.dblClick = utils.removeFromArray ( this.observers.dblClick , observer);
        };        
        
        /**
         * Action "hoverIn" sur l'objet représentant une cellule.
         */
        CellRenderer.prototype.hoverIn = function(evt){
            var hoverInObservers = this.observers.hoverIn.slice();
            for (var observerName in hoverInObservers) {
                var observer = hoverInObservers[observerName];
                observer.notify(evt, this);
            }
            this.refresh();
        };
        
        CellRenderer.prototype.onHoverIn = function( observer ){
            this.observers.hoverIn.push(observer);
        };
        
        CellRenderer.prototype.unHoverIn = function( observer ){
            this.observers.hoverIn = utils.removeFromArray( this.observers.hoverIn , observer);
        };
        
        /**
         * Action "hoverOut" sur l'objet représentant une cellule.
         */
        CellRenderer.prototype.hoverOut = function(evt){
            var hoverOutObservers = this.observers.hoverOut.slice();
            for (var observerName in hoverOutObservers) {
                var observer = hoverOutObservers[observerName];
                observer.notify(evt, this);
            }
            this.refresh();
        };    
        
        CellRenderer.prototype.onHoverOut = function( observer ){
            this.observers.hoverOut.push(observer);
        };
        
        CellRenderer.prototype.unHoverOut = function( observer ){
            this.observers.hoverOut = utils.removeFromArray ( this.observers.hoverOut , observer);
        };
        
        CellRenderer.prototype.globalGrid = function(){
            return this.cell.hexaGrid
        }
        CellRenderer.prototype.globalRenderer = function(){
            return this.globalGrid().renderer.renderer;
        };
        
        
        /**
         * Effectue le tracé de la cellule.
         *
         ** [method]
         *
         * Par défaut, une cellule est représentée par un hexagone, centré sur son origine.
         * L'objet "renderer" que l'on crée ici, est un objet Element de Raphael.JS ; il porte la
         * structure du comportement graphique de la cellule.
         */
        CellRenderer.prototype.render = function(){
            if(typeof this.renderer !== 'undefined'){
                return;
            }
            var cellRenderer = this; // Définition d'une variable locale, qui sera valable pour le scope de toutes les fonction internes ci-dessous.
            var cell = this.cell; // Définition d'une variable locale, qui sera valable pour le scope de toutes les fonction internes ci-dessous.
            
            var path = utils.drawHexagon(cell.origin);
            this.renderer = this.globalRenderer().path(path)
                .attr('fill', cell.color)
                .attr('fill-opacity', cell.state.opacity / 2 )
                .attr('stroke-width', '0.5')
                .hover(hoverInCell, hoverOutCell)
                .click(clickCell)
                .dblclick(dblClickCell);
                
            /* Définition du "click" sur une cellule, en s'appuyant sur le CellRenderer. */
            function clickCell(evt) {
                cellRenderer.click(evt);
            }
            /* Définition du "double-click" sur une cellule, en s'appuyant sur le CellRenderer. */
            function dblClickCell(evt) {
                cellRenderer.dblClick(evt);
            }
            /* Définition du "hover-in" sur une cellule, en s'appuyant sur le CellRenderer. */
            function hoverInCell(evt) {
                cellRenderer.hoverIn(evt);
            }
            /* Définition du "hover-out" sur une cellule, en s'appuyant sur le CellRenderer. */
            function hoverOutCell(evt) {
                cellRenderer.hoverOut(evt);
            }     
        };
        
        CellRenderer.prototype.refresh = function(){
             var cell = this.cell;
             this.renderer
                .attr('fill', cell.color)
                .attr('fill-opacity', cell.state.opacity )
                .attr('stroke-width', '0.5');
            this.globalGrid().refresh();
        }
                
        /****************************************\
         * Cell Menu
        \****************************************/
        function CellMenu( ) {
        }
        
        CellMenu.prototype.render = function(){
            var cellmenu = this; // Définition d'une variable locale, qui sera valable pour le scope de tout les fonction internes ci-dessous.
        };
        
        CellMenu.prototype.show = function( cell ){
            var cellmenu = this; // Définition d'une variable locale, qui sera valable pour le scope de tout les fonction internes ci-dessous.
            this.cellController = new CellControler(cell);
        };
        
        /* ******************************
         * Utilitaires
         * ******************************/
         var utils = {

            /*\
             * Fonction technique permettant de retrouver récursivement un enfant dans l'objet donné.
            \*/
            findChildRecursively: function (ownerObject, childName) {
                for (var child in ownerObject) {
                    if (child === childName) {
                        return ownerObject[childName];
                    }
                }
                for (var child in ownerObject) {
                    var result = findChildRecursively(ownerObject[child], childName);
                    if (result !== null) {
                        return result;
                    }
                }
                return null;
            },
            
            removeFromArray: function ( _array, item ){
                var index = _array.indexOf(item) ;
                if (index > -1) {
                    var result = _array.splice(index, 1);
                    // alert("_array : " + _array.length);
                    return _array;
                }
                return _array;
            },            
            
            /**
             * Renvoie le tracé d'un hexagone, à partir de son centre, de la dimension de son côté, 
             * et de son apothème.
             */
            drawHexagon: function( hexagonCenter ){    
                var side = properties.side;
                var apothem = properties.apothem;
                var point = hexagonCenter.toBrowserXY();
                var hexaDrawn =
                       "M" + (point.x + side) + "," + (point.y)
                     + "l" + (- side / 2) + "," + (- apothem)
                     + "l" + (- side) + "," + (0)
                     + "l" + (- side / 2) + "," + (apothem)
                     + "l" + (side / 2) + "," + (apothem)
                     + "l" + (side) + "," + (0)
                     + "Z";
                return hexaDrawn;
            }
            
        };
        
        // INIT
        
    

        /*\
         * EXPOSE Cells
        \*/
        
        window.HexaCellGrid = HCG;
}));