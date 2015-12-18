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
        
        
        
        /*** *** *** *** ***\
         * Hexa Cell Grid
        [ method ]
         **
        \*** *** *** *** ***/
        function HxCellGrid( properties ) {
            this.properties =  new Properties(properties);
            this.cells =[];
        }
        var _CS = new HxCellGrid(properties);
        
        
        /**\
         * Refresh
         **
         * Affiche le contenu de l'écran
        \**/
        HxCellGrid.prototype.init = function() {
            this.renderer = Raphael('content', $('#content').width(), $('#content').height());
        };
        
        HxCellGrid.prototype.getProperty = function( propertyName ) {
            return this.properties.get(propertyName);
        };
        
        HxCellGrid.prototype.draw = function() {
            return this.renderer;
        };
        
        /**\
         * Charge un fichier JSON permettant d'initialiser HxCellGrid.
        \**/
        HxCellGrid.prototype.load = function (data) {
            this.data = JSON.parse(data);
        };

        /**\
         * Sauvegarde des données, sous forme de JSON.
        \**/
        HxCellGrid.prototype.save = function() {
            alert('Data Saved!');
            var savedData = window.open();
            savedData.document.write(JSON.stringify(this.cells));
        };

        /**\
         * Refresh
         **
         * Affiche le contenu de l'écran
        \**/
        HxCellGrid.prototype.refresh = function() {
            this.renderer.clear();
            this.showCellAt(this.renderer, 10, 12);
        }
            
        // GESTION INTERNE DES CELLULES

        /**\
         * GetCell
        \**/
        HxCellGrid.prototype.getCell = function( x, y ){
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
        HxCellGrid.prototype.addCell = function( cell ){
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
        HxCellGrid.prototype.showCellAt = function(renderer, x, y ){
            if(typeof y !== 'undefined'){
                var cell = this.getCell(x, y);
                if(!cell){
                    cell = new Cell(x, y);
                    this.addCell(cell);
                } 
                cell.show( renderer );
                return;
            } 
            var point = x;
            this.showCellAt(renderer, point.x, point.y);
        };

        /**\
         * HideCell
        \**/
        HxCellGrid.prototype.hideCellAt = function( renderer, x, y ){
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
        HxCellGrid.prototype.dropCellAt = function( renderer, x, y ){
            if(y){
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
            
        /**
         * Cell
         **/
        function Cell( x , y ) {            
            this.origin = new Point(x, y);
            this.color = _CS.getProperty('defaultColor');
        }

        /**
         * Renvoie l'élément représentant la cellule dans le navigateur.
         */
        Cell.prototype.findCellRenderer = function( renderer ){
            var point = this.origin.toBrowserXY();
            var cellRenderer = renderer.getElementByPoint(point.x, point.y);
            return cellRenderer;
        };    
        
        /**
         * TODO.
         */
        Cell.prototype.hide = function( renderer ){
            var cellRenderer = this.findCellRenderer(renderer);
            if(cellRenderer){
                cellRenderer.hide();
            }
        };    

        /**
         * TODO
         */
        Cell.prototype.drop = function( renderer ){    
            var cellRenderer = this.findCellRenderer(renderer);
            if(cellRenderer){
                cellRenderer.remove();
            }
        };        
        
        /**
         * TODO
         */
        Cell.prototype.show = function( renderer ){
            var cellRenderer = this.findCellRenderer(renderer);
            if(cellRenderer) {
                cellRenderer.show();
            } else {
                this.draw(renderer);
            }
        };        

        /**
         * Renvoie la description du chemin permettant de générer un hexagone.
         */
        Cell.prototype.drawPath = function(){    
            var side = _CS.getProperty('side');
            var apothem = _CS.getProperty('apothem');
            var point = this.origin.toBrowserXY();
            var path =
                "M" + (point.x + side) + "," + (point.y)
                 + "l" + (- side / 2) + "," + (- apothem)
                 + "l" + (- side) + "," + (0)
                 + "l" + (- side / 2) + "," + (apothem)
                 + "l" + (side / 2) + "," + (apothem)
                 + "l" + (side) + "," + (0)
                 + "Z";
            return path;
        };        
        
        Cell.prototype.draw = function( renderer ){
            var cell = this; // Définition d'une variable locale, qui sera valable pour le scope de tout les fonction internes ci-dessous.
            var path = cell.drawPath();
            var cellRenderer = renderer.path(path)
                .attr('fill', cell.color)
                .attr('fill-opacity', '0.05')
                .attr('stroke-width', '0.5')
                .hover(
                    function () {
                        this.attr('fill-opacity', '0.8');
                    },
                    function () {
                        this.attr('fill-opacity', '0.05')
                    })
                .click(select);
            /* Comportement de sélection de la cellule. */
            function select() {
                // Re-définition du nouveau comportement
                cellRenderer.unclick(select);
                cellRenderer.click(unselect);
                
                cellRenderer.attr('fill', 'green');
                cell.selectCell(renderer);
            }
            /* Comportement lorsque l'on dé-sélectionne la cellule. */
            function unselect() {
                // Re-définition du nouveau comportement
                cellRenderer.unclick(unselect);
                cellRenderer.click(select);
                
                cellRenderer.attr('fill', cell.color)
                cell.hideCell(renderer);
            }

        };
        
        Cell.prototype.selectCell = function( renderer ){    
            _CS.showCellAt(renderer, Point.U(this.origin));
            _CS.showCellAt(renderer, Point.V(this.origin));
            _CS.showCellAt(renderer, Point.W(this.origin));
            _CS.showCellAt(renderer, Point.U(this.origin, -1));
            _CS.showCellAt(renderer, Point.V(this.origin, -1));
            _CS.showCellAt(renderer, Point.W(this.origin, -1));
        };
        
        Cell.prototype.hideCell = function( renderer ){
            _CS.hideCellAt(renderer, Point.U(this.origin));
            _CS.hideCellAt(renderer, Point.V(this.origin));
            _CS.hideCellAt(renderer, Point.W(this.origin));
            _CS.hideCellAt(renderer, Point.U(this.origin, -1));
            _CS.hideCellAt(renderer, Point.V(this.origin, -1));
            _CS.hideCellAt(renderer, Point.W(this.origin, -1));
        };
        
        /**
         * Cell Menu
         **/ 
        function CellMenu( ) {
        }
        
        CellMenu.prototype.render = function(){
            var cellmenu = this; // Définition d'une variable locale, qui sera valable pour le scope de tout les fonction internes ci-dessous.
        };
        
        CellMenu.prototype.show = function( cell ){
            var cellmenu = this; // Définition d'une variable locale, qui sera valable pour le scope de tout les fonction internes ci-dessous.
            this.cellController = new CellControler(cell);
        };
        
        /**
         * CELL CONTROLLER
         */
        function CellControler( cell ){
            this.cell = cell;
            
            // copy cellData
            for(var cellProperty in cell){
                this[cellProperty] = cell[cellProperty];
            }
        }
        
        CellControler.prototype.save = function (){
            for(var property in this){
                cell[cellProperty] = this[cellProperty];
            }
        }
        
        
        CellControler.prototype.discard = function (){
        }
        
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
            } 
        };
        
        // INIT
        
    

        /*\
         * EXPOSE Cells
        \*/
        
        window.HxCellGrid = _CS;
}));

/**
 * Bootstrap
 */
$(document).ready(function () {
    $('#content').append('<div id="devtools"></div>').css('position', 'absolute');
    $('#devtools')
        .append('<button type="button" id="refresh">Refresh</button>')
        .append('<button type="button" id="save">Sauver</button>');
    HxCellGrid.init();
    HxCellGrid.refresh();
    $('#refresh').click(function() {HxCellGrid.refresh()});
    $('#refresh').click(function() {alert(HxCellGrid.properties.get('apothem'))});
    $('#save').click(function() {HxCellGrid.save()});
    // $('#refresh').click(HxCellGrid.reset);
}, false);