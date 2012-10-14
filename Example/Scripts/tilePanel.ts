/// <reference path="jquery.d.ts" />

class Rect
{
    constructor (public x: number, public y: number, public width: number, public height: number)
    {
    }

    private static min(a: number, b: number)
    {
        return a < b ? a : b;
    }
    
    private static max(a: number, b: number)
    {
        return a > b ? a : b;
    }

    public static XDistance(r1 : Rect, r2 : Rect)
    {
        return Math.abs(r1.x - r2.x);
    }

    public static YDistance(r1: Rect, r2: Rect)
    {
        return Math.abs(r1.y - r2.y);
    }
}

class Tile
{
    public id: string;
    public isBeingDragged: bool;

    public supposedX: number;
    public supposedY: number;


    constructor (public left: number, public top: number, public content: string, public index: number)
    {
        this.id = "tile" + index;
    }

    public getHtml()
    {
        var html = "<div id='{3}' class='tile' style='position: absolute; left: {0}px; top: {1}px;'>{2}</div>";
        return html.replace("{0}", this.left.toString())
                   .replace("{1}", this.top.toString())
                   .replace("{2}", this.content)
                   .replace("{3}", this.id);
    }

    public getRect()
    {
        return new Rect(this.left, this.top, 150, 150);
    }

    public beginDrag()
    {
        this.isBeingDragged = true;
        this.supposedX = this.left;
        this.supposedY = this.top;
        $("#" + this.id).css("z-index", "999999999999");
    }

    public moveBy(x: number, y: number)
    {
        if (this.isBeingDragged)
        {
            var me = $("#" + this.id);
            me.animate({ left: "+=" + x,
                         top : "+=" + y }, 0);

            this.left += x;
            this.top += y;

            $("#info").html("Left: " + this.left + "\n" +
                           "Top : " + this.top);
        }
    }

    public moveTo(x: number, y: number)
    {
            var me = $("#" + this.id);
            me.animate({ left: x,
                         top : y }, 'fast', 'swing');
            this.left = x;
            this.top = y;
    }

    public supposePosition(x: number, y: number)
    {
        if (this.isBeingDragged)
        {
            this.supposedX = x;
            this.supposedY = y;
        }
    }

    public endDrag()
    {
        this.moveTo(this.supposedX, this.supposedY);
        $("#" + this.id).css("z-index", "");
        this.isBeingDragged = false;
    }
}

class MetroPanel
{
    private tiles: Tile[];
    private lastTileLeft: number;
    private lastTileTop: number;
    private count: number;

    private lastMouseX: number;
    private lastMouseY: number;

    constructor (public maxWidth: number, public panelId: string)
    {
        this.count = 0;
        this.lastTileLeft = -150;
        this.lastTileTop = 60;
        this.tiles = [];
    }

    public addTile(content: string, width:number, margin:number)
    {
        if (this.lastTileLeft + 160 < this.maxWidth)
            this.lastTileLeft += 160;
        else
        {
            this.lastTileLeft = 10;
            this.lastTileTop += 160;
        }

        var tile = new Tile(this.lastTileLeft, this.lastTileTop, content, this.count++);
        var html = tile.getHtml();
        $(this.panelId).after(html);
        $("#" + tile.id).mousedown(eventObject => { this.handleTileMouseDown(tile, eventObject); });
        $("#" + tile.id).mouseup(eventObject => { this.handleTileMouseUp(tile, eventObject); });
        $("#" + tile.id).mousemove(eventObject => { this.handleTileMouseMove(tile, eventObject); });

        this.tiles.push(tile);
    }

    private handleTileMouseDown(tile: Tile, eventObject: JQueryEventObject)
    {
        tile.beginDrag();
        console.log(tile.getRect());
        this.lastMouseX = eventObject.pageX;
        this.lastMouseY = eventObject.pageY;
    }    

    private handleTileMouseMove(tile: Tile, eventObject: JQueryEventObject)
    {
        if (tile.isBeingDragged)
        {
            var offsetX = eventObject.pageX - this.lastMouseX;
            var offsetY = eventObject.pageY - this.lastMouseY;
            tile.moveBy(offsetX, offsetY);
            this.lastMouseX = eventObject.pageX;
            this.lastMouseY = eventObject.pageY;

            var rect = tile.getRect();
            var xIntersections = this.tiles.filter((value, index, array) => value !== tile && 
                                                                            Rect.XDistance(value.getRect(), tile.getRect()) <= 50 &&
                                                                            value.top == tile.supposedY);            

            var yIntersections = this.tiles.filter((value, index, array) => value !== tile && 
                                                                            Rect.YDistance(value.getRect(), tile.getRect()) <= 50 &&
                                                                            value.left == tile.supposedX);  
                      
            if (xIntersections.length == 1)
            {
                var otherTile = xIntersections[0];
                var tileOriginalX = tile.supposedX;
                var tileOriginalY = tile.supposedY;

                tile.supposePosition(otherTile.left, otherTile.top);
                otherTile.moveTo(tileOriginalX, tileOriginalY);
            }            
            
            if (yIntersections.length == 1)
            {
                var otherTile = yIntersections[0];
                var tileOriginalX = tile.supposedX;
                var tileOriginalY = tile.supposedY;

                tile.supposePosition(otherTile.left, otherTile.top);
                otherTile.moveTo(tileOriginalX, tileOriginalY);
            }
        }
    }

    private handleTileMouseUp(tile: Tile, eventObject: JQueryEventObject)
    {
        if (tile.isBeingDragged)
        {
            tile.endDrag();
        }
    }
}
