/// <reference path="jquery.d.ts" />

class Tile
{
    public id: string;
    public isBeingDragged: bool;

    public supposedX: number;
    public supposedY: number;

    constructor (public left: number, public top: number, public content: string, public index: number, public width: number)
    {
        this.id = "tile" + index;
    }

    public getHtml()
    {
        var html = "<div id='{3}' class='tile' style='position: absolute; left: {0}px; top: {1}px; width: {4}px; " +
                   "-moz-user-select: none; -khtml-user-select: none;  -webkit-user-select: none; user-select: none;'>{2}</div>";
        return html.replace("{0}", this.left.toString())
                   .replace("{1}", this.top.toString())
                   .replace("{2}", this.content)
                   .replace("{3}", this.id)
                   .replace("{4}", this.width.toString());
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
        }
    }

    public moveTo(x: number, y: number)
    {
            var me = $("#" + this.id);
            me.animate({ left: x,
                         top : y }, 'fast', 'linear');
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

    public compare(other: Tile)
    {
        var top = this.isBeingDragged ? this.supposedY : this.top;
        var left = this.isBeingDragged ? this.supposedX : this.left;

        if (top < other.top)
            return -1;
        else if (top > other.top)
            return 1;
        else
        {
            if (left < other.left)
                return -1;
            else if (left > other.left)
                return 1;
            else
                return 0;
        }
    }

    public isOver(other: Tile)
    {
        var verticalDistance = Math.abs(other.top - this.top);
        var horizontalDistance = Math.abs(other.top - this.top);

        return verticalDistance <= 10 && horizontalDistance <= 10;
    }
}

class MetroPanel
{
    private tiles: Tile[];
    private newTileX: number;
    private newTileY: number;
    private count: number;

    private lastMouseX: number;
    private lastMouseY: number;

    private timeout;

    constructor (public maxWidth: number, public panelId: string, public maxHeight: number)
    {
        this.count = 0;
        this.newTileX = 10;
        this.newTileY = 60;
        this.tiles = [];
    }

    public addTile(content: string, width:number, margin:number)
    {
        if (this.newTileX + width > this.maxWidth)
        {
            this.newTileX = 10;
            this.newTileY += 160;
        }

        var tile = new Tile(this.newTileX, this.newTileY, content, this.count++, width);
        var html = tile.getHtml();
        $(this.panelId).after(html);
        $("#" + tile.id).mousedown(eventObject => { this.handleTileMouseDown(tile, eventObject); });
        $("#" + tile.id).mouseup(eventObject => { this.handleTileMouseUp(tile, eventObject); });
        $("#" + tile.id).mousemove(eventObject => { this.handleTileMouseMove(tile, eventObject); });

        this.tiles.push(tile);

        this.newTileX += width + margin;
    }

    private handleTileMouseDown(tile: Tile, eventObject: JQueryEventObject)
    {
        eventObject.preventDefault();

        tile.beginDrag();
        this.lastMouseX = eventObject.pageX;
        this.lastMouseY = eventObject.pageY;
    }    

    private handleTileMouseMove(tile: Tile, eventObject: JQueryEventObject)
    {
        eventObject.preventDefault();

        if (tile.isBeingDragged)
        {
            var offsetX = eventObject.pageX - this.lastMouseX;
            var offsetY = eventObject.pageY - this.lastMouseY;
            tile.moveBy(offsetX, offsetY);
            this.lastMouseX = eventObject.pageX;
            this.lastMouseY = eventObject.pageY;

            this.destroyTimeOut();
            this.timeout = setTimeout(() => 
            {
                var overs = this.tiles.filter((value, index, array) => value.isOver(tile)).sort((a, b) => Math.abs(a.left, - b.left));
                var over = overs[0];
                if (over)
                {
                    tile.supposePosition(tile.left, over.top);
                    this.orderPanel();
                }
            }, 100);
        }
    }

    private orderPanel()
    {
        var sorted = this.tiles.sort((a, b) => a.compare(b));

        var currentX = 10;
        var currentY = 60;
        for (var i = 0; i < this.tiles.length; i++)
        {
            var tile = sorted[i];
            
            if (currentX + tile.width > this.maxWidth)
            {
                currentX = 10;
                currentY += 160;
            }

            if (tile.isBeingDragged)
                tile.supposePosition(currentX, currentY);
            else
                tile.moveTo(currentX, currentY);

            currentX += tile.width + 10;
        }

        this.newTileX = currentX;
        this.destroyTimeOut();
    }

    private destroyTimeOut()
    {
        clearTimeout(this.timeout);
    }

    private handleTileMouseUp(tile: Tile, eventObject: JQueryEventObject)
    {
        eventObject.preventDefault();
        this.destroyTimeOut();

        if (tile.isBeingDragged)
        {
            tile.endDrag();
        }
    }
}
