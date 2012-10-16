/// <reference path="jquery-1.8.2.js" />
var lastMouseX, lastMouseY;

var Tile = (function () {
    function Tile(left, top, content, index, width, panelId) {
        this.left = left;
        this.top = top;
        this.content = content;
        this.index = index;
        this.width = width;
        this.panelId = panelId;
        this.id = panelId.substr(1) + "_tile" + index;
    }
    Tile.prototype.getHtml = function () {
        var html = "<div id='{3}' class='tile' style='position: absolute; left: {0}px; top: {1}px; width: {4}px; " + "-moz-user-select: none; -khtml-user-select: none;  -webkit-user-select: none; user-select: none;'>{2}</div>";
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
        }, 'fast', 'linear');
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
        $(".temp-placeholder").remove();
        this.moveTo(this.supposedX, this.supposedY);
        $("#" + this.id).css("z-index", "");
        this.isBeingDragged = false;
    };
    Tile.prototype.compare = function (other) {
        var top = this.isBeingDragged ? this.supposedY : this.top;
        var left = this.isBeingDragged ? this.supposedX : this.left;
        var othertop = other.isBeingDragged ? other.supposedY : other.top;
        var otherleft = other.isBeingDragged ? other.supposedX : other.left;
        if(top < othertop) {
            return -1;
        } else {
            if(top > othertop) {
                return 1;
            } else {
                if(left < otherleft) {
                    return -1;
                } else {
                    if(left > otherleft) {
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
        var horizontalDistance = Math.abs(other.left - this.left);
        return verticalDistance <= 100 && horizontalDistance <= 100;
    };
    return Tile;
})();
var MetroPanel = (function () {
    function MetroPanel(maxWidth, panelId, maxHeight) {
        this.maxWidth = maxWidth;
        this.panelId = panelId;
        this.maxHeight = maxHeight;
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
        var tile = new Tile(this.newTileX, this.newTileY, content, this.count++, width, this.panelId);
        var html = tile.getHtml();
        $(this.panelId).append(html);
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
        console.log(this.panelId);
        eventObject.preventDefault();
        tile.beginDrag();
        lastMouseX = eventObject.pageX;
        lastMouseY = eventObject.pageY;
    };
    MetroPanel.prototype.handleTileMouseMove = function (tile, eventObject) {
        var _this = this;
        eventObject.preventDefault();
        if(tile.isBeingDragged) {
            var offsetX = eventObject.pageX - lastMouseX;
            var offsetY = eventObject.pageY - lastMouseY;
            tile.moveBy(offsetX, offsetY);
            lastMouseX = eventObject.pageX;
            lastMouseY = eventObject.pageY;
            this.destroyTimeOut();
            this.timeout = setTimeout(function () {
                _this.destroyTimeOut();
                if (!_this.otherGroupIntersection(tile)) {
                    MetroPanel.findOversAndSuppose(tile, _this);
                }

                _this.destroyTimeOut();

            }, 100);
        }
    };
    MetroPanel.findOversAndSuppose = function findOversAndSuppose(tile, panel, notOrder) {
        var overs = panel.tiles.filter(function (value, index, array) {
            return tile != value && value.isOver(tile);
        }).sort(function (a, b) {
            return Math.abs(a.left - tile.left) - Math.abs(b.left - tile.left);
        });

        over = overs[0];
        if (over) {
            var testX = tile.width == 310 ? tile.left - 180 : tile.left;
            var testY = tile.width == 310 ? tile.top : over.top;
            tile.supposePosition(testX, testY);
            if (!notOrder) {
                panel.orderPanel();
            }
        }
    }
    MetroPanel.prototype.otherGroupIntersection = function (tile) {
        var _this = this;
        var tileElement = $("#" + tile.id);
        var tileAbsoluteX = tileElement.offset()["left"];
        var otherPanelsIntersection = panels.filter(function (value) {
            return value != _this && Math.abs($(value.panelId).offset()["left"] - tileAbsoluteX) <= 300;
        });

        var otherPanel = otherPanelsIntersection[0];
        if(otherPanel) {
            var tileIndex = this.tiles.indexOf(tile);
            if(tileIndex != -1) {
                this.tiles.splice(tileIndex, 1);
            }

            tileElement.unbind("mousedown");
            tileElement.unbind("mouseup");
            tileElement.unbind("mousemove");

            otherPanel.tiles.push(tile);
            var newX = $(otherPanel.panelId).offset()["left"] - tileAbsoluteX;
            tileElement.css("left", Math.abs(newX + 2) + "px");
            tile.left = Math.abs(newX);
            tileElement.appendTo(otherPanel.panelId);
            MetroPanel.findOversAndSuppose(tile, otherPanel);
            //tile.endDrag();
            _this.orderPanel();

            tileElement.mousedown(function (eventObject) { otherPanel.handleTileMouseDown(tile, eventObject); });
            tileElement.mousemove(function (eventObject) { otherPanel.handleTileMouseMove(tile, eventObject); });
            tileElement.mouseup(function (eventObject) { otherPanel.handleTileMouseUp(tile, eventObject); });


            return true;
        }
        return false;
    };
    MetroPanel.prototype.orderPanel = function () {
        $(".temp-placeholder").remove();
        var sorted = this.tiles.sort(function (a, b) {
            return a.compare(b);
        });
        var currentX = 10;
        var currentY = 60;
        var tile;
        for(var i = 0; i < this.tiles.length; i++) {
            tile = sorted[i];
            if (currentX + tile.width > this.maxWidth) {
                currentX = 10;
                currentY += 160;
            }
            if (tile.isBeingDragged) {
                var test = "<div class='temp-placeholder' style='width: {0}px; left: {1}px; top: {2}px; position: absolute;'></div>"
                           .replace("{0}", tile.width.toString())
                           .replace("{1}", currentX)
                           .replace("{2}", currentY);

                $(this.panelId).append(test);
                tile.supposePosition(currentX, currentY);
                
            } else {
                tile.moveTo(currentX, currentY);
            }
            currentX += tile.width + 10;
        }

        this.newTileX = currentX;
        this.newTileY = currentY;
    };
    MetroPanel.prototype.destroyTimeOut = function () {
        clearTimeout(this.timeout);
    };
    MetroPanel.prototype.handleTileMouseUp = function (tile, eventObject) {
        eventObject.preventDefault();
        this.destroyTimeOut();
        if(tile.isBeingDragged) {
            tile.endDrag();
        }
    };
    return MetroPanel;
})();
