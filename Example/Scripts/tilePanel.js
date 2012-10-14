var Rect = (function () {
    function Rect(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    Rect.min = function min(a, b) {
        return a < b ? a : b;
    }
    Rect.max = function max(a, b) {
        return a > b ? a : b;
    }
    Rect.XDistance = function XDistance(r1, r2) {
        return Math.abs(r1.x - r2.x);
    }
    Rect.YDistance = function YDistance(r1, r2) {
        return Math.abs(r1.y - r2.y);
    }
    return Rect;
})();
var Tile = (function () {
    function Tile(left, top, content, index) {
        this.left = left;
        this.top = top;
        this.content = content;
        this.index = index;
        this.id = "tile" + index;
    }
    Tile.prototype.getHtml = function () {
        var html = "<div id='{3}' class='tile' style='position: absolute; left: {0}px; top: {1}px;'>{2}</div>";
        return html.replace("{0}", this.left.toString()).replace("{1}", this.top.toString()).replace("{2}", this.content).replace("{3}", this.id);
    };
    Tile.prototype.getRect = function () {
        return new Rect(this.left, this.top, 150, 150);
    };
    Tile.prototype.beginDrag = function () {
        this.isBeingDragged = true;
        this.supposedX = this.left;
        this.supposedY = this.top;
        $("#" + this.id).css("z-index", "999999999999");
    };
    Tile.prototype.moveBy = function (x, y) {
        if(this.isBeingDragged) {
            var me = $("#" + this.id);
            me.animate({
                left: "+=" + x,
                top: "+=" + y
            }, 0);
            this.left += x;
            this.top += y;
            $("#info").html("Left: " + this.left + "\n" + "Top : " + this.top);
        }
    };
    Tile.prototype.moveTo = function (x, y) {
        var me = $("#" + this.id);
        me.animate({
            left: x,
            top: y
        }, 'fast', 'swing');
        this.left = x;
        this.top = y;
    };
    Tile.prototype.supposePosition = function (x, y) {
        if(this.isBeingDragged) {
            this.supposedX = x;
            this.supposedY = y;
        }
    };
    Tile.prototype.endDrag = function () {
        this.moveTo(this.supposedX, this.supposedY);
        $("#" + this.id).css("z-index", "");
        this.isBeingDragged = false;
    };
    return Tile;
})();
var MetroPanel = (function () {
    function MetroPanel(maxWidth, panelId) {
        this.maxWidth = maxWidth;
        this.panelId = panelId;
        this.count = 0;
        this.lastTileLeft = -150;
        this.lastTileTop = 60;
        this.tiles = [];
    }
    MetroPanel.prototype.addTile = function (content, width, margin) {
        var _this = this;
        if(this.lastTileLeft + 160 < this.maxWidth) {
            this.lastTileLeft += 160;
        } else {
            this.lastTileLeft = 10;
            this.lastTileTop += 160;
        }
        var tile = new Tile(this.lastTileLeft, this.lastTileTop, content, this.count++);
        var html = tile.getHtml();
        $(this.panelId).after(html);
        $("#" + tile.id).mousedown(function (eventObject) {
            _this.handleTileMouseDown(tile, eventObject);
        });
        $("#" + tile.id).mouseup(function (eventObject) {
            _this.handleTileMouseUp(tile, eventObject);
        });
        $("#" + tile.id).mousemove(function (eventObject) {
            _this.handleTileMouseMove(tile, eventObject);
        });
        this.tiles.push(tile);
    };
    MetroPanel.prototype.handleTileMouseDown = function (tile, eventObject) {
        tile.beginDrag();
        console.log(tile.getRect());
        this.lastMouseX = eventObject.pageX;
        this.lastMouseY = eventObject.pageY;
    };
    MetroPanel.prototype.handleTileMouseMove = function (tile, eventObject) {
        if(tile.isBeingDragged) {
            var offsetX = eventObject.pageX - this.lastMouseX;
            var offsetY = eventObject.pageY - this.lastMouseY;
            tile.moveBy(offsetX, offsetY);
            this.lastMouseX = eventObject.pageX;
            this.lastMouseY = eventObject.pageY;
            var rect = tile.getRect();
            var xIntersections = this.tiles.filter(function (value, index, array) {
                return value !== tile && Rect.XDistance(value.getRect(), tile.getRect()) <= 50 && value.top == tile.supposedY;
            });
            var yIntersections = this.tiles.filter(function (value, index, array) {
                return value !== tile && Rect.YDistance(value.getRect(), tile.getRect()) <= 50 && value.left == tile.supposedX;
            });
            if(xIntersections.length == 1) {
                var otherTile = xIntersections[0];
                var tileOriginalX = tile.supposedX;
                var tileOriginalY = tile.supposedY;
                tile.supposePosition(otherTile.left, otherTile.top);
                otherTile.moveTo(tileOriginalX, tileOriginalY);
            }
            if(yIntersections.length == 1) {
                var otherTile = yIntersections[0];
                var tileOriginalX = tile.supposedX;
                var tileOriginalY = tile.supposedY;
                tile.supposePosition(otherTile.left, otherTile.top);
                otherTile.moveTo(tileOriginalX, tileOriginalY);
            }
        }
    };
    MetroPanel.prototype.handleTileMouseUp = function (tile, eventObject) {
        if(tile.isBeingDragged) {
            tile.endDrag();
        }
    };
    return MetroPanel;
})();
