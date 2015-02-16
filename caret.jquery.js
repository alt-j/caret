(function($) {
    $.fn.caret = function(position) {
        var caret = new Caret(this[0]);
        if (position) {
            caret.setPosition(position);
            return this;
        } else {
            return caret.getPosition();
        }
    };

    /**
     * @name Caret
     */
    function Caret(element) {
        this._element = element;

        if (this._element.contentEditable === "true") {
            this._isContentEditableElement = true;
        }
    }

    /**
     * Get caret position in element.
     *
     * @returns {Number}
     */
    Caret.prototype.getPosition = function() {
        if (this._isContentEditableElement) {
            this._focus();
            var range = window.getSelection().getRangeAt(0),
                rangeClone = range.cloneRange();
            rangeClone.selectNodeContents(this._element);
            rangeClone.setEnd(range.endContainer, range.endOffset);
            return rangeClone.toString().length;
        } else {
            return this._element.selectionStart;
        }
    };

    /**
     * Set caret at position in element.
     *
     * @param {Number} position
     */
    Caret.prototype.setPosition = function(position) {
        if (position < 0) {
            position = this._element.textContent.length + position;
        }

        this._focus();

        if (this._isContentEditableElement) {
            var relativePosition = getRelativePosition(this._element, position);
            if (relativePosition) {
                window.getSelection().collapse(relativePosition.node, relativePosition.position);
            }
        } else {
            this._element.setSelectionRange(position, position);
        }
    };

    /**
     * Set focus to element.
     */
    Caret.prototype._focus = function() {
        if (document.activeElement !== this._element) {
            this._element.focus();
        }
    };

    /**
     * @typedef {Object} RelativePosition
     * @property {HTMLElement} node
     * @property {Number} position
     */

    /**
     * Get relative position (relative to node of maximal nesting) of caret
     * by absolute position in any parent node.
     *
     * @param {HTMLElement} node
     * @param {Number} position
     * @returns {RelativePosition} relativePosition
     */
    function getRelativePosition(node, position) {
        var currentChildOffset = 0,
            childs = node.childNodes,
            i, child, relativePosition;
        for (i = 0; i < childs.length; i++) {
            child = childs[i];
            if (child.childNodes.length > 0) {
                relativePosition = getRelativePosition(child, position - currentChildOffset);
                if (relativePosition) {
                    return relativePosition;
                }
            } else if (position <= currentChildOffset + child.textContent.length) {
                return {
                    node: child,
                    position: position - currentChildOffset
                };
            }
            currentChildOffset += child.textContent.length;
        }
    }
})(jQuery);
