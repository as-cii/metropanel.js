var Tile = (function () {
    function Tile(left, top, content, index, width) {
        this.left = left;
        this.top = top;
        this.content = content;
        this.index = index;
        this.width = width;
        this.id = "tile" + index;
    }
    Tile.prototype.getHtml = function () {
        var html = "<div id='{3}' class='tile' style='position: absolute; left: {0}px; top: {1}px; width: {4}px'>{2}</div>";
        return html.replace("{0}", this.left.toString()).replace("{1}", this.top.toString()).replace("{2}", this.content).replace("{3}", this.id).replace("{4}", this.width.toString());
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
    Tile.prototype.compare = function (other) {
        var top = this.isBeingDragged ? this.supposedY : this.top;
        var left = this.isBeingDragged ? this.supposedX : this.left;
        if(top < other.top) {
            return -1;
        } else {
            if(top > other.top) {
                return 1;
            } else {
                if(left < other.left) {
                    return -1;
                } else {
                    if(left > other.left) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    };
    Tile.prototype.isOver = function (other) {
        var verticalDistance = Math.abs(other.top - this.top);
        var horizontalDistance = Math.abs(other.top - this.top);
        return verticalDistance <= 10 && horizontalDistance <= 10;
    };
    return Tile;
})();
var MetroPanel = (function () {
    function MetroPanel(maxWidth, panelId) {
        this.maxWidth = maxWidth;
        this.panelId = panelId;
        this.count = 0;
        this.newTileX = 10;
        this.newTileY = 60;
        this.tiles = [];
    }
    MetroPanel.prototype.addTile = function (content, width, margin) {
        var _this = this;
        if(this.newTileX + width > this.maxWidth) {
            this.newTileX = 10;
            this.newTileY += 160;
        }
        var tile = new Tile(this.newTileX, this.newTileY, content, this.count++, width);
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
        this.newTileX += width + margin;
    };
    MetroPanel.prototype.handleTileMouseDown = function (tile, eventObject) {
        tile.beginDrag();
        this.lastMouseX = eventObject.pageX;
        this.lastMouseY = eventObject.pageY;
    };
    MetroPanel.prototype.handleTileMouseMove = function (tile, eventObject) {
        var _this = this;
        if(tile.isBeingDragged) {
            var offsetX = eventObject.pageX - this.lastMouseX;
            var offsetY = eventObject.pageY - this.lastMouseY;
            tile.moveBy(offsetX, offsetY);
            this.lastMouseX = eventObject.pageX;
            this.lastMouseY = eventObject.pageY;
            this.destroyTimeOut();
            this.timeout = setTimeout(function () {
                var overs = _this.tiles.filter(function (value, index, array) {
                    return value.isOver(tile);
                }).sort(function (a, b) {
                    return Math.abs(a.left, -b.left);
                });
                var over = overs[0];
                if(over) {
                    tile.supposePosition(tile.left, over.top);
                    _this.orderPanel();
                }
            }, 100);
        }
    };
    MetroPanel.prototype.orderPanel = function () {
        var sorted = this.tiles.sort(function (a, b) {
            return a.compare(b);
        });
        var currentX = 10;
        var currentY = 60;
        for(var i = 0; i < this.tiles.length; i++) {
            var tile = sorted[i];
            if(currentX + tile.width > this.maxWidth) {
                currentX = 10;
                currentY += 160;
            }
            if(tile.isBeingDragged) {
                tile.supposePosition(currentX, currentY);
            } else {
                tile.moveTo(currentX, currentY);
            }
            currentX += tile.width + 10;
        }
        this.destroyTimeOut();
    };
    MetroPanel.prototype.destroyTimeOut = function () {
        clearTimeout(this.timeout);
    };
    MetroPanel.prototype.handleTileMouseUp = function (tile, eventObject) {
        this.destroyTimeOut();
        if(tile.isBeingDragged) {
            tile.endDrag();
        }
    };
    return MetroPanel;
})();
