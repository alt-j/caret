(function ($) {
    $.fn.caret = function (position) {
        var caret = caretFactory(this[0]);
        if (position) {
            caret.setPosition(position);
        } else {
            return caret.getPosition();
        }
    };

    /**
     * Caret factory.
     */
    function caretFactory(element) {
        this._index = this._index || [];
        this._store = this._store || [];

        var index = this._index.indexOf(element);
        if (index === -1) {
            index = this._index.push(element) - 1;
            this._store[index] = new Caret(element);
        }

        return this._store[index];
    };

    /**
     * @typedef {Object} DetailedPosition
     * @property {HTMLElement} node
     * @property {Number} position
     */

    /**
     * @name Caret
     */
    function Caret(element) {
        this._element = element;
        this._isContentEditableElement = element.contentEditable === 'true';
    };

    /**
     * Get caret position in element.
     *
     * @returns {Number}
     */
    Caret.prototype.getPosition = function () {
        if (this._isContentEditableElement) {
            this._element.focus();
            var range = window.getSelection().getRangeAt(0);
            var rangeClone = range.cloneRange();
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
    Caret.prototype.setPosition = function (position) {
        if (position < 0) {
            position = this._element.textContent.length + position;
        }

        if (this._isContentEditableElement) {
            this._element.focus();

            var detailedPosition = findDetailedPosition(this._element, position);
            if (detailedPosition) {
                window.getSelection().collapse(detailedPosition.node, detailedPosition.position);
            }
        } else {
            this._element.setSelectionRange(position, position);
        }
    };

    /**
     * Find child node of maximal nesting and caret position therein by position in parent node.
     * @param {HTMLElement} node
     * @param {Number} position
     * @returns {DetailedPosition} detailedPosition
     */
    function findDetailedPosition(node, position) {
        var currentChildOffset = 0;
        var childs = node.childNodes;
        for (var i = 0; i < childs.length; i++) {
            var child = childs[i];
            if (child.childNodes.length > 0) {
                var detailedPosition = findDetailedPosition(child, position - currentChildOffset);
                if (detailedPosition) {
                    return detailedPosition;
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
